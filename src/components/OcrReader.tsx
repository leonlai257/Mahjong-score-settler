import React, { useState } from 'react'
import Tesseract from 'tesseract.js'

const regions = [
    { name: 'top', left: 260, top: 460, width: 210, height: 200 },
    { name: 'left', left: 20, top: 750, width: 210, height: 200 },
    { name: 'right', left: 510, top: 750, width: 210, height: 200 },
    { name: 'bottom', left: 260, top: 1030, width: 210, height: 200 },
]

export const OcrReader: React.FC = () => {
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<{ name: string; score: number }[]>([])
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [croppedImageUrl, setCroppedImageUrl] = useState<string[] | null>([])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            recognizeText(file)
        }
    }

    const recognizeText = async (file: File) => {
        setLoading(true)

        const img = new Image()
        const reader = new FileReader()

        reader.onload = async () => {
            img.onload = async () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) return

                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)

                ctx.strokeStyle = 'red'
                ctx.lineWidth = 3
                regions.forEach((region) => {
                    ctx.strokeRect(region.left, region.top, region.width, region.height)
                })

                const imageDataUrl = canvas.toDataURL('image/png')
                setImageUrl(imageDataUrl)

                // Convert canvas to blob for Tesseract
                canvas.toBlob(async (blob) => {
                    if (!blob) return

                    const worker = await Tesseract.createWorker('eng')

                    try {
                        await worker.setParameters({
                            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-',
                        })

                        const parsedResults: { name: string; score: number }[] = []

                        for (const region of regions) {
                            const regionCanvas = document.createElement('canvas')
                            regionCanvas.width = region.width
                            regionCanvas.height = region.height

                            const regionCtx = regionCanvas.getContext('2d')
                            if (!regionCtx) continue

                            regionCtx.drawImage(
                                img,
                                region.left,
                                region.top,
                                region.width,
                                region.height,
                                0,
                                0,
                                region.width,
                                region.height
                            )

                            // Grayscale preprocessing
                            const imageData = regionCtx.getImageData(0, 0, region.width, region.height)
                            for (let i = 0; i < imageData.data.length; i += 4) {
                                const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
                                imageData.data[i] = avg
                                imageData.data[i + 1] = avg
                                imageData.data[i + 2] = avg
                            }
                            regionCtx.putImageData(imageData, 0, 0)

                            setCroppedImageUrl((prev) => [...(prev || []), regionCanvas.toDataURL('image/png')])

                            const blob = await new Promise<Blob | null>((resolve) => regionCanvas.toBlob(resolve, 'image/png'))

                            if (!blob) continue

                            const {
                                data: { text: regionText },
                            } = await worker.recognize(blob)

                            console.log(`${region.name} region OCR text:`, regionText)

                            const match = regionText.match(/([a-zA-Z]{2,})\s*([\-]?\d+\.\d+)/)
                            if (match) {
                                parsedResults.push({ name: match[1], score: parseFloat(match[2]) })
                            }
                        }

                        setResults(parsedResults)
                    } catch (error) {
                        console.error('Tesseract error:', error)
                    } finally {
                        await worker.terminate()
                        setLoading(false)
                    }
                }, 'image/png')
            }

            img.src = reader.result as string
        }

        reader.readAsDataURL(file)
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>OCR Score Reader</h2>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {loading && <p>Processing image...</p>}
            {text && (
                <>
                    <h3>Raw Text:</h3>
                    <pre>{text}</pre>
                </>
            )}
            <h3>Cropped Image Used for OCR:</h3>
            {imageUrl && <img src={imageUrl} alt="Uploaded preview" style={{ maxWidth: '100%' }} />}
            {croppedImageUrl && croppedImageUrl?.length > 0 && (
                <div>
                    {croppedImageUrl.map((url, index) => (
                        <img key={index} src={url} alt={`Cropped region ${index}`} style={{ maxWidth: '100%' }} />
                    ))}
                </div>
            )}
            {results.length > 0 && (
                <>
                    <h3>Extracted Results:</h3>
                    <ul>
                        {results.map((r, i) => (
                            <li key={i}>
                                {r.name}: {r.score}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}
