import {useState, useRef, useEffect} from "react";
import type { FormEvent } from "react";


type HorarioOcupado = {
    data: string;
    hora: string;
};

const API_URL = "http://127.0.0.1:8000";

function formatarData(ano: number, mes: number, dia: number) {
    return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}


export function Home() {
    const [mesActual, setMesActual] = useState(() => new Date());
    const [agendamentos, setAgendamentos] = useState<HorarioOcupado[]>([]);


    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [data, setData] = useState("");
    const [hora, setHora] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const envioEmCurso = useRef(false);
    const [actualizacao, setActualizacao] = useState(0);
    const [carregandoCalendario, setCarregandoCalendario] = useState(false);
    const [erroCalendario, setErroCalendario] = useState("");

    const hoje = new Date();
    const dataHoje = formatarData(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );

    const ano = mesActual.getFullYear();
    const mes = mesActual.getMonth();


    useEffect(() => {
        const controller = new AbortController();
        setCarregandoCalendario(true);
        setErroCalendario("");
        setAgendamentos([]);

        async function carregarHorarios() {
            try {
                const parametros = new URLSearchParams({
                    inicio: formatarData(ano, mes, 1),
                    fim: formatarData(ano, mes, new Date(ano, mes + 1, 0).getDate()),
                });
                const resposta = await fetch(
                    `${API_URL}/agendamentos/ocupados?${parametros}`,
                    { signal: controller.signal },
                );

                if (!resposta.ok) {
                    throw new Error("Falha ao consultar os horarios.");
                }

                const horarios: HorarioOcupado[] = await resposta.json();
                if (!controller.signal.aborted) {
                    setAgendamentos(horarios);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setErroCalendario(
                        "Nao foi possivel carregar os horarios. Tenta actualizar.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCarregandoCalendario(false);
                }
            }
        }

        void carregarHorarios();
        return () => controller.abort();
    }, [ano, mes, actualizacao]);


    const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

    // Organiza a semana de segunda-feira a domingo.
    const primeiroDia = (new Date(ano, mes, 1).getDay() + 6) % 7;

    const tituloMes = mesActual.toLocaleDateString("pt-PT", {
        month: "long",
        year: "numeric",
    });

    function mudarMes(direccao: number) {
        setMesActual(new Date(ano, mes + direccao, 1));
    }

    async function agendar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (envioEmCurso.current) return;

        const reserva = { nome: nome.trim(), email: email.trim(), data, hora };
        if (!reserva.nome || !reserva.email) {
            setMensagem("Preenche o nome e o e-mail.");
            return;
        }

        envioEmCurso.current = true;
        setEnviando(true);
        setMensagem("");

        try {
            const resposta = await fetch(`${API_URL}/agendamentos/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reserva),
            });

            if (!resposta.ok) {
                const erro = await resposta.json().catch(() => null);
                setMensagem(
                    typeof erro?.detail === "string"
                        ? erro.detail
                        : "Nao foi possivel agendar. Verifica os dados preenchidos.",
                );
                if (resposta.status === 409) {
                    setActualizacao((valor) => valor + 1);
                }
                return;
            }

            const [anoReserva, mesReserva] = reserva.data.split("-").map(Number);
            setMesActual(new Date(anoReserva, mesReserva - 1, 1));
            setActualizacao((valor) => valor + 1);
            setMensagem("Agendamento confirmado!");
            setNome("");
            setEmail("");
            setHora("");
        } catch {
            setMensagem(
                "A ligacao foi interrompida. Confirma os horarios no calendario antes de repetir.",
            );
            setActualizacao((valor) => valor + 1);
        } finally {
            envioEmCurso.current = false;
            setEnviando(false);
        }
    }

    return (
        <>
            <section className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/pool.jpg')"}}>
                <div className="min-h-screen bg-black/40 flex flex-col items-center justify-center gap-6 px-4 text-center text-white">
                    <h1 className="text-5xl font-bold md:text-8xl">
                        Mergulhos mundiais
                    </h1>

                    <p className="text-xl">Escolhe o dia do teu próximo mergulho.</p>

                    <a href="#calendario" className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">
                        Ver calendário
                    </a>
                </div>
            </section>
            <section id="calendario" className="min-h-screen bg-slate-100 px-4 py-16">
                <div className="mx-auto max-w-4xl">
                    <h2 className="mb-8 text-center text-3xl font-bold">
                        Calendário de agendamentos
                    </h2>

                    <div className="rounded-2xl bg-white p-4 shadow-lg md:p-8">
                        <div className="mb-6 flex items-center justify-between gap-2">
                            <button type="button" onClick={() => mudarMes(-1)} aria-label="Mês anterior" className="rounded-lg bg-slate-200 px-4 py-2 hover:bg-slate-300"> ‹ </button>
                            <h3 className="text-center text-xl font-semibold capitalize">
                                {tituloMes}
                            </h3>
                            <button type="button" onClick={() => mudarMes(1)} aria-label="Mês seguinte" className="rounded-lg bg-slate-200 px-4 py-2 hover:bg-slate-300">›</button>
                        </div>
                    </div>

                    <p role="status" className="my-3 text-sm text-slate-600">
                        {carregandoCalendario ? "A carregar horarios..." : erroCalendario}
                    </p>
                    <button
                        type="button"
                        onClick={() => setActualizacao((valor) => valor + 1)}
                        disabled={carregandoCalendario}
                        className="mb-4 rounded-lg bg-slate-200 px-4 py-2 disabled:opacity-50"
                    >
                        Actualizar horarios
                    </button>
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                            (dia) => (
                                <div
                                    key={dia}
                                    className="py-2 text-center text-sm font-semibold text-slate-500"
                                >
                                    {dia}
                                </div>
                            )
                        )}

                        {Array.from({ length: primeiroDia }, (_, indice) => (
                            <div key={`vazio-${indice}`} />
                        ))}

                        {Array.from({ length: quantidadeDias }, (_, indice) => {
                            const dia = indice + 1;
                            const dataDia = formatarData(ano, mes, dia);

                            const reservas = agendamentos
                                .filter((item) => item.data === dataDia)
                                .sort((a, b) => a.hora.localeCompare(b.hora));

                            return (
                                <button
                                    key={dataDia}
                                    type="button"
                                    disabled={dataDia < dataHoje}
                                    aria-label={`Seleccionar ${dataDia}`}
                                    onClick={() => {
                                        setData(dataDia);
                                        setMensagem("");
                                        document.getElementById("agendar")?.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                    }}
                                    className={`min-h-24 min-w-0 rounded-lg border p-1 text-left align-top md:p-2 ${
                                        data === dataDia
                                            ? "border-blue-600 bg-blue-100"
                                            : "border-slate-200 hover:bg-blue-50"
                                    } disabled:cursor-not-allowed disabled:opacity-40`}
                                >
                                    <span className="block font-semibold">{dia}</span>

                                    {reservas.map((reserva) => (
                                        <span
                                            key={`${reserva.data}-${reserva.hora}`}
                                            className="mt-1 block rounded bg-blue-600 px-1 py-1 text-[10px] text-white md:text-xs"
                                        >
                        {reserva.hora.slice(0, 5)} Reservado
                      </span>
                                    ))}
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-6 text-sm text-slate-500">
                        Clica numa data para preencher o formulário.
                    </p>
                </div>
            </section>
            <section
                id="agendar"
                className="min-h-screen bg-blue-50 px-4 py-16"
            >
                <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-lg md:p-10">
                    <h2 className="mb-8 text-center text-3xl font-bold">
                        Agendar mergulho
                    </h2>

                    <form onSubmit={agendar}>
                        <fieldset disabled={enviando} className="flex flex-col gap-5 disabled:opacity-70">
                            <div>
                                <label htmlFor="nome" className="mb-2 block font-medium">
                                    Nome
                                </label>
                                <input
                                    id="nome"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={nome}
                                    onChange={(event) => setNome(event.target.value)}
                                    className="w-full rounded-lg border border-slate-300 p-3"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-2 block font-medium">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full rounded-lg border border-slate-300 p-3"
                                />
                            </div>

                            <div>
                                <label htmlFor="data" className="mb-2 block font-medium">
                                    Data
                                </label>
                                <input
                                    id="data"
                                    type="date"
                                    required
                                    min={dataHoje}
                                    value={data}
                                    onChange={(event) => setData(event.target.value)}
                                    className="w-full rounded-lg border border-slate-300 p-3"
                                />
                            </div>

                            <div>
                                <label htmlFor="hora" className="mb-2 block font-medium">
                                    Hora
                                </label>
                                <input
                                    id="hora"
                                    type="time"
                                    required
                                    value={hora}
                                    onChange={(event) => setHora(event.target.value)}
                                    className="w-full rounded-lg border border-slate-300 p-3"
                                />
                            </div>

                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                                {enviando ? "A agendar..." : "Confirmar agendamento"}
                            </button>

                            <p role="status" className="text-center text-sm text-slate-700">
                                {mensagem}
                            </p>
                        </fieldset>
                    </form>
                </div>
            </section>
        </>
    )
}