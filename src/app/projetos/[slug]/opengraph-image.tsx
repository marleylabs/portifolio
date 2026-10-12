import { PROJECT_CATEGORIES } from "@/lib/categories";
import { getAllProjects, getProject } from "@/lib/content";
import { OG_SIZE, publicImageAsDataUri, renderOgImage } from "@/lib/og";

export const alt = "Card de compartilhamento do estudo de caso, com o título e a capa do projeto";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.filter(({ isExternal }) => !isExternal).map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) throw new Error(`Projeto não encontrado: ${slug}`);

  return renderOgImage({
    eyebrow: `Estudo de caso · ${PROJECT_CATEGORIES[project.category].label}`,
    title: project.title,
    meta: project.stack.slice(0, 4).join(" · "),
    cover: await publicImageAsDataUri(project.cover.src),
  });
}
