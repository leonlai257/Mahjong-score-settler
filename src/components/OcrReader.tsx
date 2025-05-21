import React, { useState } from 'react'
import Tesseract, { OEM, PSM } from 'tesseract.js'
import { WinningText } from '.'

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

// The conversion rate for the score
const conversionRate = 1 / 60

// The minimum confidence level & the maximum number of retries for OCR recognition.
const minConfidence = 85
const maxRetries = 10

// The threshold value for sharpening the image. (0 - black, 255 - white)
const threshold = 180

interface PlayerProps {
    name: string
    score: number
    score_image: string[]
}

export const OcrReader: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [players, setPlayers] = useState<PlayerProps[]>([])
    const [images, setImages] = useState<File[]>([])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages((prev) => [...prev, ...Array.from(e.target.files!)])
        }
    }
    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
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

    const clearAll = () => {
        setImages([])
        setPlayers([])
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

    const groupedResults = players.reduce<Record<string, number>>((acc, { name, score }) => {
        const cleanName = name.trim().toLowerCase()
        acc[cleanName] = (acc[cleanName] || 0) + score
        return acc
    }, {})

    const totalScore = Object.values(groupedResults).reduce((sum: number, s: number) => sum + s, 0)

    return (
        <div style={{ padding: '1rem' }}>
            <h2>OCR Score Reader</h2>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            <button onClick={recognizeTextFromAllImages} disabled={loading || images.length === 0}>
                Calculate
            </button>

            <button onClick={clearAll} disabled={images.length === 0 && players.length === 0}>
                Clear All
            </button>
            {loading && <p>Processing images...</p>}

            {images.length > 0 && (
                <div>
                    <h3>Uploaded Images:</h3>
                    {images.map((file, index) => (
                        <div key={index} style={{ position: 'relative', display: 'inline-block', margin: 10 }}>
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Uploaded ${index}`}
                                style={{ maxWidth: 200, maxHeight: 200, display: 'block' }}
                            />
                            <button onClick={() => removeImage(index)} style={{ position: 'absolute', top: 0, right: 0 }}>
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {players.length > 0 && (
                <div className="flex flex-col">
                    <h3>Player Scores:</h3>
                    <div className="flex gap-4">
                        {Object.entries(
                            players.reduce<Record<string, { scores: number[]; images: string[] }>>((acc, player) => {
                                const key = player.name.trim()
                                if (!acc[key]) {
                                    acc[key] = { scores: [], images: [] }
                                }
                                acc[key].scores.push(player.score)
                                acc[key].images.push(...player.score_image)
                                return acc
                            }, {})
                        ).map(([name, { scores, images }], index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    margin: '16px 0',
                                    padding: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    background: '#2a2a2a',
                                    maxWidth: 320,
                                }}>
                                <span
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        marginBottom: 8,
                                        textTransform: 'capitalize',
                                    }}>
                                    {name}
                                </span>

                                <span>
                                    Total Score:
                                    <WinningText score={scores.reduce((sum, score) => sum + score, 0)} />
                                </span>
                                <span>
                                    Converted:
                                    <WinningText score={scores.reduce((sum, score) => sum + score, 0) * conversionRate} />
                                </span>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                    {scores.map((score, i) => (
                                        <div key={i} className="relative flex flex-col items-center gap-1">
                                            <WinningText score={score} />

                                            <img
                                                src={images[i]}
                                                alt={`Score image ${i}`}
                                                style={{
                                                    maxWidth: 80,
                                                    maxHeight: 80,
                                                    border: '1px solid #eee',
                                                    borderRadius: 4,
                                                    background: '#fff',
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {Object.keys(groupedResults).length > 0 && (
                <>
                    <h3>Final Results (Converted):</h3>
                    <ul>
                        {Object.entries(groupedResults).map(([name, score], i) => (
                            <li key={i}>
                                {name}: {(score * conversionRate).toFixed(4)}
                            </li>
                        ))}
                    </ul>

                    <h4>Combined Score: {totalScore.toFixed(0)}</h4>
                    <h4>Score Audit: {totalScore.toFixed(0) === '0' ? 'Correct' : 'Incorrect'}</h4>
                </>
            )}
        </div>
    )
}
