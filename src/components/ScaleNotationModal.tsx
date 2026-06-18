import { useEffect, useState, useId } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Maximize2, Minimize2 } from 'lucide-react';

interface ScaleNotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    scaleName: string;
    abcString: string;
}

export function ScaleNotationModal({ isOpen, onClose, scaleName, abcString }: ScaleNotationModalProps) {
    const id = useId().replace(/:/g, ''); // Generate a safe DOM id
    const containerId = `abc-container-${id}`;
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset expand state when modal opens for a new scale
    useEffect(() => {
        if (isOpen) {
            setIsExpanded(false);
        }
    }, [isOpen]);

    useEffect(() => {
        let renderTimeout: ReturnType<typeof setTimeout>;

        if (isOpen && abcString) {
            const render = () => {
                const el = document.getElementById(containerId);
                if (!el) return;

                import('abcjs')
                    .then((abcjs) => {
                        const renderFn = abcjs.renderAbc;
                        if (typeof renderFn === 'function') {
                            renderFn(containerId, abcString, {
                                responsive: 'resize',
                                scale: isExpanded ? 1.5 : 1
                            });
                        }
                    })
                    .catch((e) => {
                        console.error("Error loading ABCJS notation renderer:", e);
                    });
            };

            // Wait for dialog to mount
            renderTimeout = setTimeout(render, 50);
        }

        return () => {
            if (renderTimeout) clearTimeout(renderTimeout);
        };
    }, [isOpen, abcString, containerId, isExpanded]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={`${isExpanded ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl'} transition-all overflow-x-auto`}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute right-12 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    title={isExpanded ? "Collapse View" : "Expand View"}
                >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>

                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>{scaleName}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg overflow-x-auto overflow-y-auto w-full h-full" style={{ minWidth: '300px' }}>
                    <div id={containerId} className="text-black inline-block min-h-[150px]"></div>
                    {!abcString && <div className="text-red-500 mt-4">No notation available for this scale.</div>}
                </div>
            </DialogContent>
        </Dialog>
    );
}

