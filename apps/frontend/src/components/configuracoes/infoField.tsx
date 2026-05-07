export default function InfoField({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="flex items-start gap-3 p-4 bg-[#f5f5f0] rounded-2xl">
            <span className="text-xl mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
            </div>
        </div>
    );
}