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

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <CosmosLayer variant="hero" />
      <div className={styles.inner}>
        <div className={styles.text}>
          <h1 id="hero-title" className={styles.title}>
            Olá, eu sou <span className={styles.name}>{hero.name}</span>
          </h1>
          <p className={styles.subtitle}>
            {/* Espaço não separável: o destaque nunca fica sozinho na última linha. */}
            {hero.intro} {before}{"\u00a0"}
            <Sparkles>
              <strong className={styles.highlight}>{highlight}</strong>
            </Sparkles>
            {after}
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
