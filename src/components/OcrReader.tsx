import React, { useMemo, useState } from 'react'
import { WinningText } from '.'
import { useOcrReader } from '@src/lib/hooks/useOcrReader'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { count } from 'console'

// The minimum confidence level & the maximum number of retries for OCR recognition.
const minConfidence = 85
const maxRetries = 10

// The threshold value for sharpening the image. (0 - black, 255 - white)
const threshold = 180

export interface OcrReaderProps {
    defaultRate?: number
    defaultCurrency?: string
}

export const OcrReader: React.FC = ({ defaultRate = 60, defaultCurrency = 'CAD' }: OcrReaderProps) => {
    const [conversionRate, setConversionRate] = useState(defaultRate)
    const [currency, setCurrency] = useState(defaultCurrency)

    const { loading, players, images, setImages, clearAll, recognizeTextFromAllImages } = useOcrReader({
        threshold,
        maxRetries,
        minConfidence,
    })

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages((prev) => [...prev, ...Array.from(e.target.files!)])
        }
    }
    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
    }

    const groupedResults = players.reduce<Record<string, number>>((acc, { name, score }) => {
        const cleanName = name.trim().toLowerCase()
        acc[cleanName] = (acc[cleanName] || 0) + score
        return acc
    }, {})

    const totalScore = Object.values(groupedResults).reduce((sum: number, s: number) => sum + s, 0)

    const progressValue = useMemo(() => {
        return (players.map((player) => player.score_image.length).reduce((sum, count) => sum + count, 0) / (images.length * 4)) * 100
    }, [players, images])

    return (
        <div className="flex w-full flex-col gap-4 p-4">
            <Label>OCR Score Reader</Label>

            <div className="flex gap-2">
                <Input className="w-fit" type="file" accept="image/*" multiple onChange={handleImageUpload} />

                <Button onClick={recognizeTextFromAllImages} disabled={loading || images.length === 0}>
                    Calculate
                </Button>

                <Button onClick={clearAll}>Clear All</Button>
            </div>

            {loading && <Progress value={progressValue} />}

            <div className="w-full">
                <Label>
                    Conversion Rate (denominator):
                    <Input
                        type="number"
                        min={0}
                        value={conversionRate}
                        onChange={(e) => setConversionRate(parseFloat(e.target.value))}
                        style={{ marginLeft: '8px', width: '80px' }}
                    />
                </Label>
                <Label>
                    Currency:
                    <Input
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={{ marginLeft: '8px', width: '80px' }}
                    />
                </Label>
            </div>

            {images.length > 0 && (
                <div>
                    <Label>Uploaded Images:</Label>
                    {images.map((file, index) => (
                        <div key={index} style={{ position: 'relative', display: 'inline-block', margin: 10 }}>
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Uploaded ${index}`}
                                style={{ maxWidth: 200, maxHeight: 200, display: 'block' }}
                            />
                            <button onClick={() => removeImage(index)} style={{ position: 'absolute', top: 0, right: 0 }}>
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {players.length > 0 && (
                <div className="flex flex-col">
                    <Label>Player Scores:</Label>
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
                            <Card
                                key={index}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    margin: '16px 0',
                                    padding: '16px 24px',
                                }}>
                                <Label
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        marginBottom: 8,
                                        textTransform: 'capitalize',
                                    }}>
                                    {name}
                                </Label>

                                <Label>
                                    Total Score:
                                    <WinningText score={scores.reduce((sum, score) => sum + score, 0)} />
                                </Label>
                                <Label>
                                    Converted:
                                    <WinningText score={scores.reduce((sum, score) => sum + score, 0) * (1 / conversionRate)} />
                                    {currency}
                                </Label>

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
                            </Card>
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
                                {name}: {(score * (1 / conversionRate)).toFixed(4)}
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
