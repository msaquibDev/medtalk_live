import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function NotFound() {
  return <main className="not-found-page">
    <div className="not-found-brand">M <Sparkles size={14}/><small>MEDITALK ADMIN</small></div>
    <div className="not-found-code">404 | PAGE NOT FOUND</div>
    <h1>This page went<br/><em>off the agenda.</em></h1>
    <p>The page you are looking for may have moved or is no longer available.</p>
    <Link href="/" className="primary">Return to dashboard <ArrowRight size={16}/></Link>
    <div className="not-found-foot">MEDITALK ADMIN PORTAL <span>Copyright 2026</span></div>
  </main>;
}
