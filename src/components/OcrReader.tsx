import React, { use, useMemo, useState } from 'react'
import { WinningText } from '.'
import { useOcrReader } from '@src/lib/hooks/useOcrReader'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { count } from 'console'
import { Cross1Icon } from '@radix-ui/react-icons'

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

    const totalScore = useMemo(() => {
        return players.reduce((sum, player) => {
            if (!player || typeof player.score !== 'number') return sum
            return sum + player.score
        }, 0)
    }, [players])

    const progressValue = useMemo(() => {
        return (players.map((player) => player.score_image.length).reduce((sum, count) => sum + count, 0) / (images.length * 4)) * 100
    }, [players, images])

    return (
        <div className="flex w-full flex-col gap-4 p-4">
            <Card className="flex flex-col gap-2 bg-transparent p-4">
                <Label className="text-display">OCR Score Reader</Label>

                <div className="flex gap-2">
                    <Input className="w-fit" type="file" accept="image/*" multiple onChange={handleImageUpload} />

                    <Button onClick={recognizeTextFromAllImages} disabled={loading || images.length === 0}>
                        Calculate
                    </Button>

                    <Button onClick={clearAll}>Clear All</Button>
                </div>

                {loading && <Progress value={progressValue} />}

                <h4>Combined Score: {totalScore.toFixed(0)}</h4>
                <h4>Score Audit: {totalScore.toFixed(0) === '0' ? 'Correct' : 'Incorrect'}</h4>
            </Card>

            <Card className="flex flex-col gap-4 bg-transparent p-4">
                <Label>Settings</Label>
                <div className="flex gap-4">
                    <Card className="flex items-center gap-2 p-4">
                        <Label>Conversion Rate (denominator):</Label>
                        <Input
                            type="number"
                            min={0}
                            value={conversionRate}
                            onChange={(e) => setConversionRate(parseFloat(e.target.value))}
                            style={{ marginLeft: '8px', width: '80px' }}
                        />
                    </Card>
                    <Card className="flex items-center gap-2 p-4">
                        <Label>Currency:</Label>
                        <Input
                            type="text"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            style={{ marginLeft: '8px', width: '80px' }}
                        />
                    </Card>
                </div>
                <Label>
                    Example: 1000 = {(1000 * (1 / conversionRate)).toFixed(2)} {currency}
                </Label>
            </Card>
            <div>
                <Label>Images Uploaded: {images.length}</Label>
            </div>

            {images.length > 0 && (
                <div className="flex flex-col gap-4">
                    <Label>Uploaded Images:</Label>
                    <div className="flex gap-4">
                        {images.map((file, index) => (
                            <Card key={index} className="relative flex flex-col items-center ">
                                <div
                                    style={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        display: 'inline-block',
                                    }}
                                    onClick={() => removeImage(index)}
                                    title="Click to remove"
                                    className="group">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Uploaded ${index}`}
                                        style={{
                                            maxWidth: 200,
                                            maxHeight: 400,
                                            display: 'block',
                                            transition: 'box-shadow 0.2s, opacity 0.2s, filter 0.2s, border-color 0.2s',
                                        }}
                                        className="border-2 border-[#7171f8] hover:border-[#f87171] group-hover:scale-[1.03] group-hover:opacity-100 group-hover:shadow-lg group-hover:brightness-105 group-hover:filter group-hover:[filter:saturate(1.1)_drop-shadow(0_0_8px_rgba(239,68,68,0.8))_sepia(0.2)_hue-rotate(-10deg)]"
                                    />
                                    <div className="group absolute inset-0 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            title="Remove image"
                                            className="absolute flex items-center justify-center rounded-full border border-red-500 bg-white bg-opacity-80 p-1 transition-all duration-150 hover:bg-red-100"
                                            style={{
                                                left: '50%',
                                                top: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 2,
                                                width: 32,
                                                height: 32,
                                                display: 'none',
                                            }}
                                            // Show button only on hover
                                            tabIndex={-1}>
                                            <Cross1Icon color="#ef4444" width={18} height={18} />
                                        </button>
                                        <style>
                                            {`
                                                .group:hover button[type="button"][title="Remove image"] {
                                                    display: flex !important;
                                                }
                                            `}
                                        </style>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
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
        </div>
    )
}
