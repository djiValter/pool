import { useEffect, useState } from "react";
import { consultar, dataISO, hojeEmMaputo, type Horario } from "../../reservas";

export function useCalendario() {
  const hoje = hojeEmMaputo().slice(0, 10);
  const [mes, setMes] = useState(() => new Date(`${hoje.slice(0, 7)}-01T00:00:00Z`));
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [carga, setCarga] = useState(true);
  const [erroCalendario, setErroCalendario] = useState("");
  const [revisao, setRevisao] = useState(0);
  const ano = mes.getUTCFullYear();
  const indiceMes = mes.getUTCMonth();
  const dias = new Date(Date.UTC(ano, indiceMes + 1, 0)).getUTCDate();

  function actualizar() {
    setCarga(true);
    setErroCalendario("");
    setRevisao(valor => valor + 1);
  }

  useEffect(() => {
    if (!revisao) return;
    const controller = new AbortController();
    const limite = setTimeout(() => {
      controller.abort();
      setErroCalendario("A consulta demorou demasiado. Tenta actualizar.");
      setCarga(false);
    }, 45_000);
    const inicio = dataISO(new Date(Date.UTC(ano, indiceMes, 1)));
    const fim = dataISO(new Date(Date.UTC(ano, indiceMes, dias)));
    consultar(inicio, fim, controller.signal)
      .then(resultado => {
        if (!controller.signal.aborted) setHorarios(resultado);
      })
      .catch(() => {
        if (!controller.signal.aborted) setErroCalendario("Não foi possível consultar os horários. Tenta actualizar.");
      })
      .finally(() => {
        clearTimeout(limite);
        if (!controller.signal.aborted) setCarga(false);
      });
    return () => {
      clearTimeout(limite);
      controller.abort();
    };
  }, [ano, indiceMes, dias, revisao]);

  function mudarMes(delta: number) {
    setMes(new Date(Date.UTC(ano, indiceMes + delta, 1)));
    setHorarios([]);
    actualizar();
  }

  return { hoje, mes, ano, indiceMes, dias, horarios, carga, erroCalendario, actualizar, mudarMes };
}
