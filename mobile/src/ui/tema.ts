import { StyleSheet } from "react-native";

export const cores = { fundo: "#f6f5f0", escuro: "#112a2d", secundario: "#4c6669", verde: "#076659", linha: "#d8e3df", claro: "#e4f5ef", amarelo: "#fbd85b", erro: "#9a2929" };

export const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  pagina: { padding: 18, paddingBottom: 36, gap: 16, width: "100%", maxWidth: 560, alignSelf: "center" },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44, gap: 6 },
  marca: { color: cores.verde, fontWeight: "800", fontSize: 16, flexShrink: 1 },
  link: { color: cores.verde, fontWeight: "700", fontSize: 17 },
  titulo: { color: cores.escuro, fontSize: 32, fontWeight: "800", letterSpacing: -0.8 },
  subtitulo: { color: cores.escuro, fontSize: 23, fontWeight: "800" },
  texto: { color: cores.secundario, fontSize: 14, lineHeight: 21 },
  rotulo: { color: cores.escuro, fontSize: 15, fontWeight: "700" },
  cartao: { backgroundColor: "white", borderRadius: 20, borderColor: cores.linha, borderWidth: 1, padding: 13, gap: 13 },
  maiuscula: { textTransform: "capitalize" },
  erro: { color: cores.erro, fontSize: 14, lineHeight: 20 },
});
