import Link from "next/link";

const FooterTrackOrderLink = ({ className = "" }) => (
  <li className={`flex items-baseline ${className}`}>
    <Link
      href="/track"
      className="text-muted-foreground inline-block w-full hover:text-primary"
    >
      Track Order
    </Link>
  </li>
);

export default FooterTrackOrderLink;
