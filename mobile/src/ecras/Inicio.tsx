import { ImageBackground, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Botao } from "../ui/Botao";
import { cores, s } from "../ui/tema";

export function Inicio({ preparando, abrirCalendario }: {
  preparando: boolean;
  abrirCalendario: () => void;
}) {
  return (
    <ImageBackground source={require("../../assets/entrada.jpeg")} style={s.fundo}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={local.entrada}>
        <View style={local.entradaConteudo}>
          <Text style={local.marcaEntrada}>MERGULHOS{"\n"}<Text style={local.marcaDestaque}>MUNDIAIS</Text></Text>
          <Text style={local.entradaTexto}>Escolhe um dia e reserva a tua visita à piscina.</Text>
          <Botao texto={preparando ? "A preparar…" : "Agendar um mergulho"}
            variante="destaque" carregando={preparando} acao={abrirCalendario} />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const local = StyleSheet.create({
  entrada: { flex: 1, justifyContent: "flex-end", backgroundColor: "#071f2780" },
  entradaConteudo: { padding: 26, paddingBottom: 45, gap: 18, backgroundColor: "#09272cbd" },
  marcaEntrada: { color: "white", fontWeight: "900", fontSize: 42, letterSpacing: -1.5 },
  marcaDestaque: { color: cores.amarelo },
  entradaTexto: { color: "white", fontSize: 17, lineHeight: 25 },
});
