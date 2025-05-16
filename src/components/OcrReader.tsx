import React, { useState } from 'react'
import Tesseract, { OEM, PSM } from 'tesseract.js'

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

const conversionRate = 1 / 60

const minConfidence = 85
const maxRetries = 10

export const OcrReader: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<{ name: string; score: number }[]>([])
    const [croppedImageUrls, setCroppedImageUrls] = useState<
        {
            name: string
            score: string
        }[]
    >([])

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
        setCroppedImageUrls([])
        let allResults: { name: string; score: number }[] = []

        for (const file of images) {
            const result = await recognizeText(file)
            allResults = [...allResults, ...result]
        }

        setResults(allResults)
        setLoading(false)
    }

    const recognizeText = async (file: File): Promise<{ name: string; score: number }[]> => {
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
                    const parsedResults: { name: string; score: number }[] = []

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
                                    imageData.data[i] = avg
                                    imageData.data[i + 1] = avg
                                    imageData.data[i + 2] = avg
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

                            const { text: nameText, url: nameUrl } = await extractTextFromRegion(name, false)
                            const { text: scoreText, url: scoreUrl } = await extractTextFromRegion(score, true)

                            setCroppedImageUrls((prev) => [
                                ...prev,
                                {
                                    name: nameUrl,
                                    score: scoreUrl,
                                },
                            ])

                            const parsedScore = parseFloat(scoreText)

                            if (nameText && !isNaN(parsedScore)) {
                                parsedResults.push({ name: nameText.trim(), score: parsedScore })
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

    const groupedResults = results.reduce<Record<string, number>>((acc, { name, score }) => {
        const cleanName = name.trim().toLowerCase()
        acc[cleanName] = (acc[cleanName] || 0) + score
        return acc
    }, {})

    const totalScore = Object.values(groupedResults).reduce((sum, s) => sum + s, 0)

    return (
        <div style={{ padding: '1rem' }}>
            <h2>OCR Score Reader</h2>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            <button onClick={recognizeTextFromAllImages} disabled={loading || images.length === 0}>
                Calculate
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

            {croppedImageUrls.length > 0 && (
                <div className="flex flex-col">
                    <h3>Cropped Regions:</h3>
                    {/* Show the name and their score on a column */}
                    <div className="flex flex-wrap">
                        {croppedImageUrls.map((url, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img src={url.name} alt={`Cropped region ${index}`} style={{ maxWidth: '100%', marginBottom: '10px' }} />
                                <img src={url.score} alt={`Cropped region ${index}`} style={{ maxWidth: '100%', marginBottom: '10px' }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {Object.keys(groupedResults).length > 0 && (
                <>
                    <h3>Final Results (Raw):</h3>
                    <ul>
                        {Object.entries(groupedResults).map(([name, score], i) => (
                            <li key={i}>
                                {name}: {score.toFixed(4)}
                            </li>
                        ))}
                    </ul>

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
