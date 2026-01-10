export default function Skeleton({ className = '' }) {
    return (
        <div className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`}></div>
    )
}

export function ShowCardSkeleton() {
    return (
        <div className="card-glass border-slate-700/30 p-0 overflow-hidden space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
        </div>
    )
}

