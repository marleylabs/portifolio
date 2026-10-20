import { MotionToggle } from "@/components/MotionToggle/MotionToggle";
import { Search } from "@/components/Search/Search";
import { SoundToggle } from "@/components/SoundToggle/SoundToggle";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { StickyHeader } from "./StickyHeader";
import styles from "./Header.module.css";

export function Header() {
  return (
    <StickyHeader>
      <div className={styles.inner}>
        <Logo />

        <nav aria-label="Principal" className={styles.nav}>
          <NavLinks />
        </nav>

        <div className={styles.actions}>
          <Search />
          {/* No mobile, som e pausa vão para dentro do drawer para caber tudo. */}
          <span className={styles.desktopOnly}>
            <SoundToggle />
            <MotionToggle />
          </span>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </StickyHeader>
  );
}
