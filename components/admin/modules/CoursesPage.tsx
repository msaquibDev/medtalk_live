import { BookOpen, PlayCircle, Stethoscope } from "lucide-react";

export function CoursesPage() {
  return <section className="future-card"><div className="future-orbit"><BookOpen size={30}/></div><span className="future-tag">COMING SOON</span><h1>Courses are on the way</h1><p>We are shaping a dedicated space for medical learning. Course management will be available here soon.</p><div className="course-preview"><span><PlayCircle size={17}/> Video learning</span><span><Stethoscope size={17}/> Expert led</span><span>On demand</span></div></section>;
}
