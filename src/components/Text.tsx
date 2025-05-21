export const WinningText = ({ score }: { score: number }) => {
    return (
        <span
            style={{
                fontWeight: 'bold',
                fontSize: '1.3rem',
                color: score > 0 ? 'green' : score < 0 ? 'red' : '#555',
                background: score > 0 ? 'rgba(0,200,0,0.08)' : score < 0 ? 'rgba(200,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                padding: '4px 12px',
                borderRadius: '6px',
                display: 'inline-block',
            }}>
            {score.toFixed(2)}
        </span>
    )
}
