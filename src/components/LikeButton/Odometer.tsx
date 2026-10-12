import styles from "./Odometer.module.css";

// Fita "circular": um 9 antes do 0 e um 0 depois do 9 cobrem a ultrapassagem da mola,
// que de outro modo mostraria um vão vazio nas pontas.
const STRIP = "901234567890".split("");
const format = new Intl.NumberFormat("pt-BR");

/**
 * Número que "rola" como um odômetro: cada dígito é uma fita 0–9 deslocada até o valor
 * certo, com a mola dos tokens. Colunas são identificadas pela posição a partir da
 * direita, então ao ir de 9 para 10 a coluna das unidades rola e a das dezenas aparece.
 * Puramente visual (aria-hidden): quem usa leitor de tela recebe o número em texto.
 */
export function Odometer({ value }: { value: number }) {
  const chars = format.format(value).split("");

  return (
    <span className={styles.odometer} aria-hidden="true">
      {chars.map((char, index) => {
        const key = chars.length - index;
        if (!/\d/.test(char)) {
          return (
            <span key={`sep-${key}`} className={styles.separator}>
              {char}
            </span>
          );
        }
        return (
          <span key={key} className={styles.column}>
            <span className={styles.strip} style={{ transform: `translateY(${(-(Number(char) + 1) * 100) / STRIP.length}%)` }}>
              {STRIP.map((digit, position) => (
                <span key={position}>{digit}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
