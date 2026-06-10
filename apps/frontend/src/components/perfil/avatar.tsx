type AvatarProps = {
    name: string;
    frameLabel?: string | null;
    themeLabel?: string | null;
};

export default function Avatar({ name, frameLabel, themeLabel }: AvatarProps) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
    const hasFrame = Boolean(frameLabel);
    const themeClass = themeLabel ? 'from-emerald-500 via-lime-400 to-green-500' : 'from-green-400 to-emerald-600';
    return (
        <div
            className={`relative shrink-0 rounded-[1.5rem] p-1 ${
                hasFrame ? 'bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 shadow-[0_12px_30px_rgba(245,158,11,0.22)]' : 'bg-transparent'
            }`}
        >
            <div
                className={`flex h-16 w-16 items-center justify-center rounded-[1.15rem] bg-gradient-to-br ${themeClass} shadow-lg ring-2 ring-white/70`}
            >
                <span className="font-syne text-xl font-bold text-white">{initials}</span>
            </div>
            {frameLabel && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white shadow-sm ring-2 ring-amber-300" />}
        </div>
    );
}
