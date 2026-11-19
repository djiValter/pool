import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { cores } from "./tema";

export function Botao({ texto, acao, variante = "principal", desactivado = false, carregando = false }: {
  texto: string;
  acao: () => void;
  variante?: "principal" | "secundario" | "destaque";
  desactivado?: boolean;
  carregando?: boolean;
}) {
  const indisponivel = desactivado || carregando;
  const textoEscuro = variante !== "principal";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: carregando, disabled: indisponivel }}
      disabled={indisponivel}
      onPress={acao}
      style={({ pressed }) => [
        local.botao,
        variante === "secundario" && local.borda,
        variante === "destaque" && local.amarelo,
        (desactivado || pressed) && local.atenuado,
      ]}
    >
      {carregando && <ActivityIndicator size="small" color={textoEscuro ? cores.escuro : "white"} />}
      <Text style={[local.botaoTexto, textoEscuro && local.botaoTextoEscuro]}>{texto}</Text>
    </Pressable>
  );
}

const local = StyleSheet.create({
  botao: { minHeight: 48, borderRadius: 13, backgroundColor: cores.verde, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, paddingVertical: 10 },
  amarelo: { backgroundColor: cores.amarelo },
  borda: { backgroundColor: "white", borderColor: cores.linha, borderWidth: 1 },
  atenuado: { opacity: 0.55 },
  botaoTexto: { color: "white", fontWeight: "800", fontSize: 15, textAlign: "center", flexShrink: 1 },
  botaoTextoEscuro: { color: cores.escuro },
});
