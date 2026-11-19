import { useEffect, useRef, useState } from "react";
import { BackHandler, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { Reserva } from "./reservas";
import { Inicio } from "./src/ecras/Inicio";
import { Calendario } from "./src/ecras/Calendario";
import { Formulario } from "./src/ecras/Formulario";
import { Confirmacao } from "./src/ecras/Confirmacao";
import { useCalendario } from "./src/reservas/useCalendario";
import { useFormulario } from "./src/reservas/useFormulario";
import { s } from "./src/ui/tema";

type Tela = "inicio" | "calendario" | "formulario" | "confirmacao";

function Pool() {
  const calendario = useCalendario();
  const formulario = useFormulario();
  const { actualizar } = calendario;
  const { enviando } = formulario;
  const [tela, setTela] = useState<Tela>("inicio");
  const [preparando, setPreparando] = useState(false);
  const temporizadorEntrada = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState("");
  const [reserva, setReserva] = useState<Reserva>();

  function abrirCalendario() {
    if (temporizadorEntrada.current !== null) return;

    setPreparando(true);
    actualizar();

    temporizadorEntrada.current = setTimeout(() => {
      temporizadorEntrada.current = null;
      setPreparando(false);
      setTela("calendario");
    }, 2000);
  }

  useEffect(() => {
    return () => {
      if (temporizadorEntrada.current !== null) {
        clearTimeout(temporizadorEntrada.current);
      }
    };
  }, []);

  function escolherData(dia: string) {
    setData(dia);
    formulario.prepararDia();
    setTela("formulario");
  }

  function confirmar() {
    void formulario.confirmar({
      data,
      horariosDia: calendario.horarios.filter(item => item.data === data),
      indisponivel: calendario.carga || !!calendario.erroCalendario,
      actualizar,
      aoConfirmar: confirmada => {
        setReserva(confirmada);
        setTela("confirmacao");
      },
    });
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (enviando) return true;
      if (tela === "inicio") return false;
      setTela(tela === "calendario" ? "inicio" : "calendario");
      return true;
    });
    return () => subscription.remove();
  }, [tela, enviando]);

  if (tela === "inicio") {
    return <Inicio preparando={preparando} abrirCalendario={abrirCalendario} />;
  }

  return (
    <SafeAreaView style={s.fundo}>
      <StatusBar barStyle="dark-content" />
      <ScrollView key={tela} contentContainerStyle={s.pagina} keyboardShouldPersistTaps="handled">
        <View style={s.topo}>
          <Text style={s.marca}>Mergulhos Mundiais</Text>
          {tela !== "confirmacao" && (
            <Pressable accessibilityRole="button" disabled={enviando} hitSlop={10}
              onPress={() => setTela(tela === "calendario" ? "inicio" : "calendario")}>
              <Text style={s.link}>‹ Voltar</Text>
            </Pressable>
          )}
        </View>
        {tela === "calendario" && <Calendario calendario={calendario} data={data} escolherData={escolherData} />}
        {tela === "formulario" && <Formulario data={data} calendario={calendario} formulario={formulario} confirmar={confirmar} />}
        {tela === "confirmacao" && reserva && <Confirmacao reserva={reserva} voltar={() => setTela("calendario")} />}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return <SafeAreaProvider><Pool /></SafeAreaProvider>;
}
