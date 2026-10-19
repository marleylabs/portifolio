import { Avatar } from "@/components/Avatar/Avatar";
import { PushButton } from "@/components/PushButton/PushButton";
import { CosmosLayer } from "@/components/Cosmos/CosmosLayer";
import { SolarSystem } from "@/components/SolarSystem/SolarSystem";
import { Sparkles } from "@/components/Sparkles/Sparkles";
import { hero } from "@/lib/site";
import { HeroWaves } from "./HeroWaves";
import styles from "./Hero.module.css";

export function Hero() {
  const { before, highlight, after } = hero.proof;
  const cut = before.lastIndexOf(" ");

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <CosmosLayer variant="hero" />
      <div className={styles.inner}>
        <div className={styles.text}>
          <h1 id="hero-title" className={styles.title}>
            Olá, eu sou <span className={styles.name}>{hero.name}</span>
          </h1>
          <p className={styles.subtitle}>
            {hero.intro} {before.slice(0, cut)}{" "}
            {/* O Sparkles é inline-block, e a linha pode quebrar antes dele: o nowrap mantém a
                última palavra junto do destaque, que nunca fica sozinho na última linha. */}
            <span className={styles.nowrap}>
              {before.slice(cut + 1)}{" "}
              <Sparkles>
                <strong className={styles.highlight}>{highlight}</strong>
              </Sparkles>
              {after}
            </span>
          </p>
          <div className={styles.actions}>
            <PushButton href="/projetos">Ver projetos</PushButton>
            <PushButton href="/artigos" variant="secondary">
              Ler os artigos
            </PushButton>
          </div>
        </div>

        <div className={styles.visual}>
          <SolarSystem>
            <Avatar alt={hero.avatarAlt} />
          </SolarSystem>
        </div>
      </div>

      <HeroWaves />
    </section>
  );
}
