export default function ZapIcon({ size }: { size?: number }) {
    return (
        <svg width={size ?? "20"} height={size ?? "20"} viewBox="0 0 19 19" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.2501 2L3.57023 10.0159C3.30863 10.3298 3.17782 10.4868 3.17582 10.6193C3.17409 10.7346 3.22544 10.8442 3.31508 10.9167C3.4182 11 3.62252 11 4.03117 11H9.50014L8.75014 17L15.43 8.98411C15.6917 8.67018 15.8225 8.51322 15.8245 8.38065C15.8262 8.26541 15.7748 8.15577 15.6852 8.08333C15.5821 8 15.3778 8 14.9691 8H9.50014L10.2501 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

    );
}
