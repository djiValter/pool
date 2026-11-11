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
    const [contacto, setContacto] = useState("");
    const [numeroPessoas, setNumeroPessoas] = useState(1);
    const [tipo, setTipo] = useState<"normal" | "privado">("normal");

    const precoPorPessoa = tipo === "normal" ? 100 : 150;
    const total = numeroPessoas * precoPorPessoa;

    const totalFormatado = new Intl.NumberFormat("pt-MZ", {
        style: "currency",
        currency: "MZN",
    }).format(total);

    const hoje = new Date();
    const dataHoje = formatarData(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );

    const ano = mesActual.getFullYear();
    const mes = mesActual.getMonth();

    function actualizarCalendario() {
        setCarregandoCalendario(true);
        setErroCalendario("");
        setAgendamentos([]);
        setActualizacao((valor) => valor + 1);
    }

    useEffect(() => {
        const controller = new AbortController();

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
        actualizarCalendario();
    }

    async function agendar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (envioEmCurso.current) return;

        const reserva = {
            nome: nome.trim(),
            email: email.trim(),
            contacto: contacto.trim(),
            numero_pessoas: numeroPessoas,
            tipo,
            data,
            hora,
        };

        if (!reserva.nome || !reserva.email) {
            setMensagem("Preenche o nome e o e-mail.");
            return;
        }

        if (!contacto.trim()) {
            setMensagem("Preenche o contacto.");
            return;
        }

        if (!Number.isInteger(numeroPessoas) || numeroPessoas < 1) {
            setMensagem("Indica um número inteiro de pessoas, igual ou superior a 1.");
            return;
        }

        envioEmCurso.current = true;
        setEnviando(true);
        setMensagem("");
        setContacto("");
        setNumeroPessoas(1);
        setTipo("normal");

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
                        : "Não foi possível agendar. Verifica os dados preenchidos.",
                );

                if (resposta.status === 409) {
                    actualizarCalendario();
                }

                return;
            }

            const [anoReserva, mesReserva] = reserva.data.split("-").map(Number);

            setMesActual(new Date(anoReserva, mesReserva - 1, 1));
            actualizarCalendario();

            setMensagem("Agendamento confirmado!");
            setNome("");
            setEmail("");
            setHora("");
        } catch {
            setMensagem(
                "A ligação foi interrompida. Confirma os horários no calendário antes de repetir.",
            );
            actualizarCalendario();
        } finally {
            envioEmCurso.current = false;
            setEnviando(false);
        }
    }

    return (
        <>
            <section className="bg-[#f6f5f0] px-4 py-12 text-slate-900 sm:px-6 lg:py-20">
                <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <p className="mb-5 text-xs font-bold tracking-[0.2em] text-teal-700 uppercase">
                            Reservas · Mergulhos Mundiais
                        </p>

                        <h1 className="max-w-xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
                            Um espaço na tua agenda.
                            <span className="block text-teal-700">
                    Um mergulho no teu dia.
                </span>
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-7 text-slate-600">
                            Consulta os horários reservados, escolhe uma data
                            e organiza a tua próxima visita à piscina.
                        </p>

                        <a
                            href="#calendario"
                            className="mt-8 inline-flex items-center gap-3 rounded-full bg-teal-800 px-6 py-3.5 font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                        >
                            Escolher uma data
                            <span aria-hidden="true">↓</span>
                        </a>

                        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-slate-200 pt-6">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    01 · Consulta
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Explora o calendário
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    02 · Reserva
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Selecciona o teu horário
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <img
                            src="/pool.jpeg"
                            alt="Vista da piscina"
                            className="h-72 w-full rounded-[2rem] object-cover sm:h-96 lg:h-[480px]"
                        />

                        <div className="absolute right-4 bottom-4 left-4 rounded-2xl border border-white/50 bg-white/95 p-5 shadow-sm sm:right-6 sm:bottom-6 sm:left-6">
                            <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase">
                                Planeia a tua visita
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                Escolhe o momento que combina contigo.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="calendario"
                aria-labelledby="titulo-calendario"
                className="scroll-mt-6 bg-[#f6f5f0] px-3 pb-16 sm:px-6 lg:pb-24"
            >
                <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">
                                A tua próxima visita
                            </p>

                            <h2
                                id="titulo-calendario"
                                className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                            >
                                Escolhe o teu dia
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                As etiquetas indicam os horários já reservados.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={actualizarCalendario}
                            disabled={carregandoCalendario}
                            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                        >
                            <span aria-hidden="true">↻</span>
                            {carregandoCalendario
                                ? "A actualizar…"
                                : "Actualizar horários"}
                        </button>
                    </div>

                    <div className="p-3 sm:p-8">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold capitalize sm:text-2xl">
                                {tituloMes}
                            </h3>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => mudarMes(-1)}
                                    aria-label="Mês anterior"
                                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-2xl text-slate-600 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700"
                                >
                                    <span aria-hidden="true">‹</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => mudarMes(1)}
                                    aria-label="Mês seguinte"
                                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-2xl text-slate-600 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700"
                                >
                                    <span aria-hidden="true">›</span>
                                </button>
                            </div>
                        </div>

                        <p
                            role="status"
                            className="mb-4 min-h-5 text-sm text-slate-600"
                        >
                            {carregandoCalendario
                                ? "A carregar horários…"
                                : erroCalendario}
                        </p>

                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                                (dia) => (
                                    <div
                                        key={dia}
                                        className="pb-3 text-center text-xs font-semibold text-slate-400 sm:text-sm"
                                    >
                                        {dia}
                                    </div>
                                ),
                            )}

                            {Array.from({ length: primeiroDia }, (_, indice) => (
                                <div key={`vazio-${indice}`} />
                            ))}

                            {Array.from({ length: quantidadeDias }, (_, indice) => {
                                const dia = indice + 1;
                                const dataDia = formatarData(ano, mes, dia);
                                const seleccionado = data === dataDia;
                                const passado = dataDia < dataHoje;
                                const ehHoje = dataDia === dataHoje;
                                const diaSemana = new Date(ano, mes, dia).getDay();
                                const fimDeSemana = diaSemana === 0 || diaSemana === 6;

                                const reservas = agendamentos
                                    .filter((item) => item.data === dataDia)
                                    .sort((a, b) => a.hora.localeCompare(b.hora));

                                return (
                                    <button
                                        key={dataDia}
                                        type="button"
                                        disabled={passado || !fimDeSemana || enviando}
                                        aria-pressed={seleccionado}
                                        aria-current={ehHoje ? "date" : undefined}
                                        aria-label={`Seleccionar ${dataDia}. ${reservas.length} horários reservados.`}
                                        onClick={() => {
                                            setData(dataDia);
                                            setMensagem("");

                                            document.getElementById("agendar")?.scrollIntoView({
                                                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                                                    ? "instant"
                                                    : "smooth",
                                                block: "start",
                                            });
                                        }}
                                        className={`flex min-h-24 min-w-0 flex-col items-stretch rounded-xl border p-1 text-left transition sm:min-h-32 sm:p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-35 ${
                                            seleccionado
                                                ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700"
                                                : "border-slate-100 bg-slate-50/70 enabled:hover:border-teal-300 enabled:hover:bg-teal-50/50"
                                        }`}
                                    >
                                        <span
                                            className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                                                ehHoje
                                                ? "bg-teal-800 text-white"
                                                : "text-slate-700" 
                                            }`}
                                        >
                                            {dia}
                                        </span>

                                        {reservas.map((reserva) => (
                                            <span
                                                key={`${reserva.data}-${reserva.hora}`}
                                                className="mt-1 block rounded-md bg-slate-200 px-0.5 py-1 text-center text-[10px] font-medium text-slate-600 sm:text-xs"
                                            >
                                                {reserva.hora.slice(0, 5)}
                                                <span className="hidden lg:inline">
                                                    {" "}reservado
                                                </span>
                                            </span>
                                        ))}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:text-sm">
                <span className="inline-flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-teal-800"
                    />
                    Hoje
                </span>

                            <span className="inline-flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="h-3 w-3 rounded border border-teal-700 bg-teal-50"
                    />
                    Dia seleccionado
                </span>

                            <span className="inline-flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="h-3 w-3 rounded bg-slate-200"
                    />
                    Horário reservado
                </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-500">
                            Selecciona um dia para continuar no formulário de reserva.
                        </p>
                    </div>
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
                                <p className="mt-4 text-sm text-slate-500">
                                    Reservas disponíveis aos sábados e domingos, das 12:00 às 20:00.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="hora" className="mb-2 block font-medium">
                                    Hora
                                </label>
                                <input
                                    id="hora"
                                    type="time"
                                    min="12:00"
                                    max="20:00"
                                    step={60}
                                    required
                                    value={hora}
                                    onChange={(event) => setHora(event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 p-3"
                                />

                                <p className="mt-2 text-sm text-slate-500">
                                    Horário de reservas das 12:00 às 20:00.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="contacto" className="mb-2 block font-medium">
                                    Contacto
                                </label>

                                <input
                                    id="contacto"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={contacto}
                                    onChange={(event) => setContacto(event.target.value)}
                                    placeholder="Ex. +258 84 123 4567"
                                    className="w-full rounded-xl border border-slate-300 p-3 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
                                />
                            </div>

                            <div>
                                <label htmlFor="numeroPessoas" className="mb-2 block font-medium">
                                    Número de pessoas
                                </label>

                                <input
                                    id="numeroPessoas"
                                    type="number"
                                    min={1}
                                    step={1}
                                    required
                                    value={numeroPessoas || ""}
                                    onChange={(event) =>
                                        setNumeroPessoas(Number(event.target.value))
                                    }
                                    className="w-full rounded-xl border border-slate-300 p-3 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
                                />
                            </div>

                            <fieldset>
                                <legend className="mb-3 font-medium">Tipo de reserva</legend>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {(["normal", "privado"] as const).map((opcao) => (
                                        <label
                                            key={opcao}
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                                                tipo === opcao
                                                    ? "border-teal-700 bg-teal-50"
                                                    : "border-slate-200"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="tipo"
                                                value={opcao}
                                                checked={tipo === opcao}
                                                onChange={() => setTipo(opcao)}
                                                className="accent-teal-700"
                                            />

                                            <span>
                                                <span className="block font-semibold capitalize">
                                                    {opcao}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {opcao === "normal" ? 100 : 150} MT por pessoa
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <div
                                aria-live="polite"
                                className="rounded-2xl bg-teal-50 p-5"
                            >
                                <p className="text-sm text-teal-800">
                                    {numeroPessoas} pessoa(s) × {precoPorPessoa} MT
                                </p>
                                <p className="mt-2 text-2xl font-bold text-teal-950">
                                    {totalFormatado}
                                </p>
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