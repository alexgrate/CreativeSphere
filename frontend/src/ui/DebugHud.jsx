import { useJourney } from "../stores/useJourney";

export default function DebugHud() {
    const { sceneTitle, sceneLocal, progress } = useJourney()
    return (
        <div
            style={{
                position: 'fixed',
                top: 16,
                left: 16,
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'monospace',
                fontSize: 13,
                pointerEvents: 'none',
            }}
        >
            {sceneTitle} - {Math.round(sceneLocal * 100)}%
            &nbsp;·&nbsp; journey {Math.round(progress * 100)}%
        </div>
    )
}