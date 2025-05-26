import { useState } from 'react'
import Tesseract, { OEM, PSM } from 'tesseract.js'

// Pre-determined region for cropping the image
const regions = [
    {
        section: 'top',
        name: { left: 260, top: 460, width: 210, height: 60 },
        score: { left: 260, top: 520, width: 210, height: 140 },
    },

    { section: 'left', name: { left: 20, top: 750, width: 210, height: 60 }, score: { left: 20, top: 810, width: 210, height: 140 } },
    { section: 'right', name: { left: 510, top: 750, width: 210, height: 60 }, score: { left: 510, top: 810, width: 210, height: 140 } },
    {
        section: 'bottom',
        name: { left: 260, top: 1030, width: 210, height: 60 },
        score: { left: 260, top: 1090, width: 210, height: 140 },
    },
]

export interface PlayerProps {
    name: string
    score: number
    score_image: string[]
}

export interface OcrReaderHookProps {
    threshold?: number
    maxRetries?: number
    minConfidence?: number
}

export const useOcrReader = ({ threshold = 180, maxRetries = 10, minConfidence = 85 }: OcrReaderHookProps) => {
    const [loading, setLoading] = useState(false)
    const [players, setPlayers] = useState<PlayerProps[]>([])
    const [images, setImages] = useState<File[]>([])

    const clearAll = () => {
        setImages([])
        setPlayers([])
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages((prev) => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
        setPlayers([])
    }

    const recognizeTextFromAllImages = async () => {
        setLoading(true)
        setPlayers([])

        let allResults: PlayerProps[] = []

        for (const file of images) {
            const result = await recognizeText(file)
            allResults = [...allResults, ...result]
        }

        setPlayers(allResults)
        setLoading(false)
    }

    const recognizeText = async (file: File): Promise<PlayerProps[]> => {
        return new Promise((resolve) => {
            const img = new Image()
            const reader = new FileReader()

            reader.onload = () => {
                img.onload = async () => {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')
                    if (!ctx) return resolve([])

                    canvas.width = img.width
                    canvas.height = img.height
                    ctx.drawImage(img, 0, 0)

                    const worker = await Tesseract.createWorker('eng', OEM.DEFAULT)
                    const parsedResults: PlayerProps[] = []

                    try {
                        for (const region of regions) {
                            const { name, score } = region

                            const extractTextFromRegion = async (
                                regionBox: typeof name | typeof score,
                                isScore: boolean = false
                            ): Promise<{ text: string; url: string }> => {
                                const regionCanvas = document.createElement('canvas')
                                regionCanvas.width = regionBox.width
                                regionCanvas.height = regionBox.height

                                const regionCtx = regionCanvas.getContext('2d')
                                if (!regionCtx)
                                    return {
                                        text: '',
                                        url: '',
                                    }

                                regionCtx.drawImage(
                                    img,
                                    regionBox.left,
                                    regionBox.top,
                                    regionBox.width,
                                    regionBox.height,
                                    0,
                                    0,
                                    regionBox.width,
                                    regionBox.height
                                )

                                const imageData = regionCtx.getImageData(0, 0, regionBox.width, regionBox.height)
                                for (let i = 0; i < imageData.data.length; i += 4) {
                                    const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
                                    const value = avg < threshold ? 0 : 255
                                    imageData.data[i] = value
                                    imageData.data[i + 1] = value
                                    imageData.data[i + 2] = value
                                }
                                regionCtx.putImageData(imageData, 0, 0)

                                const url = regionCanvas.toDataURL('image/png')

                                const blob = await new Promise<Blob | null>((resolve) => regionCanvas.toBlob(resolve, 'image/png'))

                                if (!blob)
                                    return {
                                        text: '',
                                        url: '',
                                    }

                                await worker.setParameters({
                                    tessedit_char_whitelist: isScore
                                        ? '0123456789.-'
                                        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',

                                    tessedit_char_blacklist: isScore
                                        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
                                        : '0123456789.-',
                                    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
                                    preserve_interword_spaces: '1',
                                    classify_bln_numeric_mode: '1',
                                })

                                let attempt = 0
                                let text = ''
                                let confidence = 0

                                while (attempt < maxRetries && confidence < minConfidence) {
                                    const {
                                        data: { text: t, confidence: c },
                                    } = await worker.recognize(blob)

                                    text = t.trim()
                                    confidence = c
                                    attempt++
                                    console.log(`Attempt ${attempt}: ${text} (Confidence: ${confidence})`)
                                }

                                const { data } = await worker.recognize(blob)

                                console.log('Recognized text:', data)

                                return { text, url }
                            }

                            const { text: nameText } = await extractTextFromRegion(name, false)
                            const { text: scoreText, url: scoreUrl } = await extractTextFromRegion(score, true)

                            // Make it that it finds the person with the same name and append the scoreUrl(image link to the array)
                            const existingIndex = players.findIndex((player) => player.name === nameText)
                            if (existingIndex !== -1) {
                                const existingPlayer = players[existingIndex]
                                const updatedPlayer = {
                                    ...existingPlayer,
                                    score: existingPlayer.score + parseFloat(scoreText),
                                    score_image: [...existingPlayer.score_image, scoreUrl],
                                }

                                setPlayers((prev) => {
                                    const updated = [...prev]
                                    updated[existingIndex] = updatedPlayer
                                    return updated
                                })
                            } else {
                                setPlayers((prev) => [
                                    ...prev,
                                    {
                                        name: nameText,
                                        score: parseFloat(scoreText),
                                        score_image: [scoreUrl],
                                    },
                                ])
                            }

                            console.log(players)

                            const parsedScore = parseFloat(scoreText)

                            if (nameText && !isNaN(parsedScore)) {
                                parsedResults.push({
                                    name: nameText.trim(),
                                    score: parsedScore,
                                    score_image: [scoreUrl],
                                })
                            }
                        }
                    } catch (error) {
                        console.error('Tesseract error:', error)
                    } finally {
                        await worker.terminate()
                        resolve(parsedResults)
                    }
                }

                img.src = reader.result as string
            }

            reader.readAsDataURL(file)
        })
    }

    return {
        loading,
        players,
        images,
        setImages,
        removeImage,
        handleImageUpload,
        clearAll,
        recognizeTextFromAllImages,
    }
}
