export default function Title({ title }: { title: string }) {
    return (
        <h2 className="text-4xl md:text-6xl font-bold text-gold mb-8 tracking-tight font-title">
            {title}
        </h2>
    )
}