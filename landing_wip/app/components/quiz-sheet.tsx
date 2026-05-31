"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Sheet, Scroll } from "@silk-hq/components";
import { motion, AnimatePresence } from "framer-motion";
import "./quiz-sheet.css";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Read top-to-bottom. All timing/spring values live here.
 *
 * Step transitions:
 *   forward → current screen slides out left, new slides in from right
 *   back    → current screen slides out right, new slides in from left
 *   duration 320ms, ease-out-quint
 *
 * Within each question screen:
 *     0ms   kicker + title appear (carried by slide)
 *    60ms   options cascade in (stagger 50ms each)
 *
 * Option selection:
 *     0ms   scale 1.0 → 0.97 (press feel)
 *   120ms   scale 0.97 → 1.0 (spring settle)
 *   check mark scales 0.4 → 1.0 with spring
 *
 * Progress bar:
 *   spring { stiffness: 400, damping: 35 } — slight overshoot
 *
 * Result reveal:
 *     0ms   crest label fades in
 *   100ms   title slides up
 *   200ms   lead text fades in
 *   350ms   pillars cascade (stagger 80ms)
 *   700ms   closing card slides up
 *   900ms   menu section fades in
 * ───────────────────────────────────────────────────────── */

/* ─── Quiz data ─── */

type QuizOption = { t: string; p?: number; none?: boolean };
type Question = {
  kicker: string;
  title: string;
  sub?: string;
  multi: boolean;
  options: QuizOption[];
};

const QUESTIONS: Question[] = [
  {
    kicker: "01 / 08",
    title: "¿En qué etapa de la vida estás?",
    multi: false,
    options: [
      { t: "18–29" },
      { t: "30–45" },
      { t: "46–60" },
      { t: "60+" },
    ],
  },
  {
    kicker: "02 / 08",
    title: "¿Qué es lo que más sentís que cambió en vos últimamente?",
    multi: false,
    options: [
      { t: "Me siento más cansada/o de lo normal", p: 2 },
      { t: "Mi digestión está más sensible", p: 1 },
      { t: "Me siento inflamada/o o pesada/o", p: 1 },
      { t: "Me cuesta concentrarme o tener claridad mental", p: 2 },
      { t: "El estrés afecta mucho mi cuerpo", p: 2 },
      { t: "Estoy intentando sentirme mejor en general", p: 3 },
    ],
  },
  {
    kicker: "03 / 08",
    title: "¿Cómo se siente normalmente tu día a día?",
    multi: false,
    options: [
      { t: "Muy acelerado", p: 2 },
      { t: "Mentalmente agotador", p: 2 },
      { t: "Siempre corriendo", p: 2 },
      { t: "Bastante equilibrado, pero quiero optimizar mi bienestar", p: 3 },
      { t: "Intento cuidarme, pero me cuesta mantener constancia", p: 1 },
      { t: "El estrés suele afectar cómo me siento físicamente", p: 2 },
    ],
  },
  {
    kicker: "04 / 08",
    title: "¿Qué sentís que tu cuerpo viene intentando decirte?",
    sub: "Elegí todas las que apliquen",
    multi: true,
    options: [
      { t: "Hinchazón frecuente", p: 1 },
      { t: "Digestión pesada después de comer", p: 1 },
      { t: "Estreñimiento", p: 1 },
      { t: "Sensibilidad digestiva", p: 1 },
      { t: "Bajones de energía durante el día", p: 2 },
      { t: "Niebla mental", p: 2 },
      { t: "Antojos frecuentes de azúcar", p: 2 },
      { t: "Digestión irregular", p: 1 },
      { t: "Sensación de inflamación", p: 1 },
      { t: "Ninguna de estas", p: 3, none: true },
    ],
  },
  {
    kicker: "05 / 08",
    title: "¿Qué te gustaría sentir más en tu vida diaria?",
    multi: false,
    options: [
      { t: "Energía sostenida", p: 2 },
      { t: "Mejor digestión", p: 1 },
      { t: "Más claridad mental", p: 2 },
      { t: "Sentirme más liviana/o", p: 1 },
      { t: "Más equilibrio", p: 1 },
      { t: "Sentirme mejor con mi cuerpo", p: 1 },
      { t: "Mejor recuperación y nutrición", p: 2 },
      { t: "Una rutina saludable más fácil de mantener", p: 3 },
    ],
  },
  {
    kicker: "06 / 08",
    title: "¿Alguna de estas situaciones te representa?",
    sub: "Elegí todas las que apliquen",
    multi: true,
    options: [
      { t: "Intento comer saludable, pero me cuesta mantener consistencia", p: 1 },
      { t: "Soy sensible al gluten", p: 1 },
      { t: "Los lácteos no me hacen sentir bien", p: 1 },
      { t: "Llevo una alimentación alta en proteínas", p: 2 },
      { t: "Ya probé probióticos antes", p: 3 },
      { t: "Prefiero wellness a través de alimentos y no cápsulas", p: 3 },
      { t: "Me interesa la microbiota y la salud intestinal", p: 3 },
      { t: "Ninguna de estas", p: 0, none: true },
    ],
  },
  {
    kicker: "07 / 08",
    title: '¿Cuándo sentís más que "no sos vos misma/o"?',
    multi: false,
    options: [
      { t: "Después de comer", p: 1 },
      { t: "A mitad de tarde", p: 2 },
      { t: "En momentos de estrés", p: 2 },
      { t: "Cuando me despierto", p: 2 },
      { t: "Durante semanas muy ocupadas", p: 2 },
      { t: "Cambia constantemente", p: 3 },
    ],
  },
  {
    kicker: "08 / 08",
    title: "¿Cuál de estas frases sentís más cercana a vos?",
    multi: false,
    options: [
      { t: "Quiero hábitos saludables que realmente encajen en mi vida", p: 1 },
      { t: "Busco formas más naturales de cuidar mi cuerpo", p: 3 },
      { t: "Me importa lo que consumo", p: 3 },
      { t: "Quiero sentirme bien de manera constante, no temporal", p: 2 },
      { t: "Estoy intentando reconectarme con mi bienestar", p: 1 },
      { t: "Me interesa prevenir antes que solamente solucionar problemas", p: 3 },
    ],
  },
];

type ProfileResult = {
  crest: string;
  title: string;
  lead: string;
  pillars: string[];
  closing: string;
};

const RESULTS: Record<number, ProfileResult> = {
  1: {
    crest: "Tu perfil MicroCore",
    title: "Tu cuerpo podría estar necesitando más equilibrio y soporte diario.",
    lead: "Según tus respuestas, es posible que tu bienestar se esté viendo afectado por el ritmo de vida, el estrés y la forma en que tu cuerpo está procesando la alimentación diaria.",
    pillars: [
      "Mejorar digestión y liviandad",
      "Sostener energía durante el día",
      "Apoyar la microbiota intestinal",
      "Incorporar hábitos simples y sostenibles",
    ],
    closing:
      "MicroCore fue diseñado para acompañar el bienestar desde adentro, combinando ingredientes funcionales en un formato fácil de integrar a tu rutina.",
  },
  2: {
    crest: "Tu perfil MicroCore",
    title: "Tu cuerpo podría estar pidiendo más energía y recuperación.",
    lead: "Las respuestas indican que podrías estar experimentando desgaste físico o mental asociado al ritmo diario, el estrés y una necesidad de mayor soporte nutricional.",
    pillars: [
      "Energía más estable",
      "Claridad mental",
      "Recuperación y nutrición diaria",
      "Hábitos funcionales sostenibles",
    ],
    closing:
      "MicroCore combina nutrición funcional y bienestar digestivo para acompañar estilos de vida modernos de forma simple y natural.",
  },
  3: {
    crest: "Tu perfil MicroCore",
    title: "Parece que ya tenés conciencia sobre tu bienestar y buscás optimizarlo.",
    lead: "Tus respuestas muestran interés por una alimentación más consciente, bienestar digestivo y herramientas simples que ayuden a sostener una rutina saludable.",
    pillars: [
      "Prevención y bienestar a largo plazo",
      "Nutrición funcional",
      "Microbiota y digestión",
      "Hábitos fáciles de mantener",
    ],
    closing:
      "MicroCore fue creado justamente para integrarse de forma práctica a rutinas modernas de wellness y alimentación funcional.",
  },
};

/* ─── 7-day menus ─── */

const MEAL_LABELS = ["Desayuno", "Almuerzo", "Merienda", "Cena"] as const;

type DayMenu = { m: string[]; mc: number };
type MenuProfile = { intro: string; days: DayMenu[] };

const MENUS: Record<number, MenuProfile> = {
  1: {
    intro:
      "Comidas livianas, fáciles de digerir y con fibra gradual para apoyar tu microbiota. MicroCore se integra una vez al día, idealmente con líquidos.",
    days: [
      { m: ["Smoothie de banana, frutillas y yogur natural (o de coco) + 1 cda de MicroCore", "Merluza al horno con puré de calabaza y hojas verdes", "Manzana asada con canela y nueces", "Sopa crema de zucchini con tostada de masa madre"], mc: 0 },
      { m: ["Avena cocida con manzana rallada, canela y chía", "Pollo grillado con arroz integral y zanahoria asada", "Yogur natural (o kéfir) con arándanos + 1 cda de MicroCore", "Tortilla de espinaca con papa al horno"], mc: 2 },
      { m: ["Tostadas de masa madre con palta y huevo poché", "Bowl de quinoa, garbanzos, pepino y palta", "Smoothie de pera, espinaca y jengibre + 1 cda de MicroCore", "Calabaza rellena con vegetales"], mc: 2 },
      { m: ["Porridge de avena con banana y manteca de maní + 1 cda de MicroCore", "Salmón al horno con boniato y brócoli al vapor", "Bastones de zanahoria y pepino con hummus", "Caldo de verduras con fideos de arroz y pollo"], mc: 0 },
      { m: ["Yogur natural (o de coco) con granola sin azúcar y frutillas", "Wok de vegetales con pollo (o tofu) y arroz integral", "Té de jengibre + 1 cda de MicroCore en agua", "Merluza con puré de boniato y rúcula"], mc: 2 },
      { m: ["Panqueques de avena y banana con yogur + 1 cda de MicroCore", "Ensalada tibia de lentejas, zanahoria y huevo", "Manzana y un puñado de almendras", "Zapallitos rellenos con quinoa y vegetales"], mc: 0 },
      { m: ["Bowl de yogur (o coco), kiwi, banana y semillas de zapallo", "Pollo al horno con calabaza y ensalada verde", "Smoothie de frutillas, remolacha y jengibre + 1 cda de MicroCore", "Sopa crema de calabaza con tostada de masa madre"], mc: 2 },
    ],
  },
  2: {
    intro:
      "Más proteína y carbohidratos complejos para energía estable y recuperación. MicroCore acompaña una comida principal cada día.",
    days: [
      { m: ["Huevos revueltos con espinaca y tostada integral + smoothie con 1 cda de MicroCore", "Bife magro a la plancha con arroz integral y ensalada", "Yogur natural con avena, banana y nueces", "Salmón con quinoa y brócoli"], mc: 0 },
      { m: ["Porridge de avena con frutos rojos, semillas y manteca de maní", "Pechuga de pollo con boniato al horno y hojas verdes + 1 cda de MicroCore en agua", "Tostada integral con palta y huevo", "Lentejas guisadas con vegetales y arroz"], mc: 1 },
      { m: ["Smoothie de banana, avena, cacao y manteca de maní + 1 cda de MicroCore", "Salmón (o atún) con quinoa, garbanzos y vegetales asados", "Yogur griego con arándanos y semillas de zapallo", "Wok de carne magra con vegetales y fideos de arroz"], mc: 0 },
      { m: ["Tostadas integrales con queso untable, palta y huevo", "Pollo grillado con arroz integral y verduras salteadas", "Smoothie de frutillas, banana y yogur + 1 cda de MicroCore", "Merluza al horno con puré de calabaza y espinaca"], mc: 2 },
      { m: ["Bowl de yogur, granola, banana y nueces + 1 cda de MicroCore", "Bife magro con boniato al horno y ensalada", "Fruta y un puñado de almendras", "Tortilla de papa y espinaca con ensalada"], mc: 0 },
      { m: ["Huevos al plato con tomate y tostada integral", "Salmón con arroz integral y brócoli + 1 cda de MicroCore en agua", "Yogur con avena, frutas y semillas", "Guiso de lentejas con zanahoria y calabaza"], mc: 1 },
      { m: ["Panqueques de avena y banana con yogur y frutos rojos + 1 cda de MicroCore", "Pollo al horno con quinoa y vegetales asados", "Tostada con palta y huevo poché", "Wok de vegetales y carne magra con arroz integral"], mc: 0 },
    ],
  },
  3: {
    intro:
      "Diversidad vegetal, fermentados y alimentos integrales para nutrir la microbiota a largo plazo. MicroCore suma a tu base ya consciente.",
    days: [
      { m: ["Bowl de kéfir (o yogur) con frutos rojos, granola sin azúcar y lino + 1 cda de MicroCore", "Buddha bowl de quinoa, garbanzos, palta, remolacha y hojas verdes", "Manzana con manteca de almendras", "Salmón con boniato y vegetales asados"], mc: 0 },
      { m: ["Tostadas de masa madre con palta, chucrut y huevo", "Pollo con arroz integral, brócoli y zanahoria asada", "Smoothie verde (espinaca, pera, jengibre, chía) + 1 cda de MicroCore", "Sopa de miso con vegetales y tofu"], mc: 2 },
      { m: ["Porridge de avena con manzana, canela, nueces y lino", "Ensalada completa de lentejas, quinoa, palta y vegetales + 1 cda de MicroCore en agua", "Yogur o kéfir con arándanos y semillas de zapallo", "Merluza con calabaza asada y rúcula"], mc: 1 },
      { m: ["Smoothie de açaí, banana, frutos rojos y espinaca + 1 cda de MicroCore", "Wok de tofu (o pollo) con vegetales variados y arroz integral", "Crudités con hummus de remolacha", "Salmón con quinoa y espárragos"], mc: 0 },
      { m: ["Bowl de yogur, kiwi, semillas y granola sin azúcar", "Curry suave de garbanzos y vegetales con arroz integral + 1 cda de MicroCore en agua", "Fruta de estación y frutos secos", "Tortilla de vegetales con ensalada de hojas amargas"], mc: 1 },
      { m: ["Tostadas integrales con palta, tomate y semillas + kéfir con 1 cda de MicroCore", "Bowl mediterráneo: quinoa, garbanzos, pepino, aceitunas y feta", "Smoothie de pera, espinaca y jengibre", "Pescado al horno con vegetales asados y boniato"], mc: 0 },
      { m: ["Panqueques de avena con frutos rojos, yogur y semillas", "Ensalada tibia de lentejas, calabaza y rúcula + 1 cda de MicroCore en agua", "Yogur o kéfir con granola y arándanos", "Wok de vegetales y tofu con arroz integral"], mc: 1 },
    ],
  },
};

/* ─── Helpers ─── */

const TOTAL = QUESTIONS.length;

const CHECK_SVG = (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12.5l4.5 4.5L19 7"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const X_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const CHEVRON_LEFT_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="QuizSheet-backIcon">
    <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function computeProfile(answers: Record<number, number[]>): number {
  const score: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  QUESTIONS.forEach((q, qi) => {
    (answers[qi] || []).forEach((i) => {
      const p = q.options[i]?.p;
      if (p) score[p]++;
    });
  });
  let best = 1;
  let max = -1;
  [1, 2, 3].forEach((k) => {
    if (score[k] > max) {
      max = score[k];
      best = k;
    }
  });
  return best;
}

function BoldMicroCore({ text }: { text: string }) {
  const match = text.match(/(1 cda de MicroCore(?: en agua)?)/);
  if (!match) return <>{text}</>;
  const idx = text.indexOf(match[0]);
  return (
    <>
      {text.slice(0, idx)}
      <b>{match[0]}</b>
      {text.slice(idx + match[0].length)}
    </>
  );
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/* ─── Animation configs ─── */

const SLIDE = {
  offsetX: 60,              // px the screen slides from
  duration: 0.32,           // seconds
  ease: [0.22, 1, 0.36, 1], // ease-out-quint
} as const;

const OPTIONS = {
  stagger: 0.05,            // seconds between each option reveal
  offsetY: 10,              // px each option slides up from
  spring: { type: "spring" as const, stiffness: 500, damping: 30 },
} as const;

const SELECTION = {
  tapScale: 0.97,           // pressed-in scale
  spring: { type: "spring" as const, stiffness: 500, damping: 25 },
} as const;

const PROGRESS = {
  spring: { type: "spring" as const, stiffness: 400, damping: 35 },
} as const;

const RESULT_TIMING = {
  crest: 0,                 // seconds after mount
  title: 0.1,
  lead: 0.2,
  pillars: 0.35,
  pillarStagger: 0.08,
  closing: 0.7,
  menu: 0.9,
} as const;

const RESULT_SPRING = { type: "spring" as const, stiffness: 350, damping: 28 } as const;

/* ─── Silk context ─── */

type QuizSheetContextType = {
  setTrack: (t: "top" | "bottom") => void;
  restingOutside: boolean;
};

const QuizSheetContext = createContext<QuizSheetContextType | null>(null);

/* ─── Sheet compound components ─── */

type SheetRootProps = React.ComponentPropsWithoutRef<typeof Sheet.Root>;

const QuizSheetRoot = React.forwardRef<
  React.ElementRef<typeof Sheet.Root>,
  Omit<SheetRootProps, "license"> & { license?: SheetRootProps["license"] }
>(({ children, ...props }, ref) => (
  <Sheet.Root license="commercial" {...props} ref={ref}>
    {children}
  </Sheet.Root>
));
QuizSheetRoot.displayName = "QuizSheet.Root";

const QuizSheetView = React.forwardRef<
  React.ElementRef<typeof Sheet.View>,
  React.ComponentPropsWithoutRef<typeof Sheet.View>
>(({ children, className, onTravelStatusChange, ...props }, ref) => {
  const [restingOutside, setRestingOutside] = useState(false);
  const [track, setTrack] = useState<"top" | "bottom">("bottom");

  useEffect(() => {
    if (restingOutside) setTrack("bottom");
  }, [restingOutside]);

  return (
    <QuizSheetContext.Provider value={{ setTrack, restingOutside }}>
      <Sheet.View
        className={`QuizSheet-view ${className ?? ""}`.trim()}
        contentPlacement="center"
        tracks={track}
        swipeOvershoot={false}
        nativeEdgeSwipePrevention={true}
        enteringAnimationSettings={{
          easing: "spring",
          stiffness: 480,
          damping: 45,
          mass: 1.5,
        }}
        onTravelStatusChange={(status) => {
          setRestingOutside(status === "idleOutside");
          onTravelStatusChange?.(status);
        }}
        {...props}
        ref={ref}
      >
        {children}
      </Sheet.View>
    </QuizSheetContext.Provider>
  );
});
QuizSheetView.displayName = "QuizSheet.View";

const QuizSheetBackdrop = React.forwardRef<
  React.ElementRef<typeof Sheet.Backdrop>,
  React.ComponentPropsWithoutRef<typeof Sheet.Backdrop>
>(({ className, ...props }, ref) => (
  <Sheet.Backdrop
    className={`QuizSheet-backdrop ${className ?? ""}`.trim()}
    themeColorDimming="auto"
    {...props}
    ref={ref}
  />
));
QuizSheetBackdrop.displayName = "QuizSheet.Backdrop";

const QuizSheetContent = React.forwardRef<
  React.ElementRef<typeof Sheet.Content>,
  React.ComponentPropsWithoutRef<typeof Sheet.Content>
>(({ children, className, ...props }, ref) => {
  const scrollRef = useRef<any>(null);
  const context = useContext(QuizSheetContext);
  if (!context) throw new Error("QuizSheetContent must be inside QuizSheetView");
  const { setTrack, restingOutside } = context;

  const scrollHandler = useCallback(
    ({ progress }: any) => {
      if (restingOutside) return;
      setTrack(progress < 0.5 ? "bottom" : "top");
    },
    [restingOutside, setTrack],
  );

  return (
    <Sheet.Content
      className={`QuizSheet-content ${className ?? ""}`.trim()}
      asChild
      {...props}
      ref={ref}
    >
      <Scroll.Root className="QuizSheet-scrollRoot" componentRef={scrollRef} asChild>
        <Scroll.View
          className="QuizSheet-scrollView"
          onScroll={scrollHandler}
          onFocusInside={{ scrollIntoView: true }}
        >
          <Scroll.Content className="QuizSheet-scrollContent">
            <div className="QuizSheet-innerContent">{children}</div>
          </Scroll.Content>
        </Scroll.View>
      </Scroll.Root>
    </Sheet.Content>
  );
});
QuizSheetContent.displayName = "QuizSheet.Content";

/* ─── Quiz body ─── */

function TopBar({
  step,
  onBack,
}: {
  step: number;
  onBack: () => void;
}) {
  const showBack = step > 0 && step <= TOTAL;
  return (
    <div className="QuizSheet-topBar">
      {showBack ? (
        <button type="button" className="QuizSheet-back" onClick={onBack}>
          {CHEVRON_LEFT_SVG}
        </button>
      ) : (
        <div className="QuizSheet-backSpacer" />
      )}
      <Sheet.Trigger action="dismiss" asChild>
        <button type="button" className="QuizSheet-dismiss">{X_SVG}</button>
      </Sheet.Trigger>
    </div>
  );
}

function QuizBody() {
  const [step, setStep] = useState(-1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const progress =
    step < 0
      ? 0
      : step < TOTAL
        ? ((step + 1) / (TOTAL + 1)) * 100
        : step === TOTAL
          ? 95
          : 100;

  function goForward() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function selectOption(questionIdx: number, optionIdx: number) {
    const q = QUESTIONS[questionIdx];
    const opt = q.options[optionIdx];
    const current = answers[questionIdx] || [];

    if (q.multi) {
      let next: number[];
      if (opt.none) {
        next = current.includes(optionIdx) ? [] : [optionIdx];
      } else {
        const noneIdx = q.options.findIndex((o) => o.none);
        const filtered = current.filter((x) => x !== noneIdx);
        next = filtered.includes(optionIdx)
          ? filtered.filter((x) => x !== optionIdx)
          : [...filtered, optionIdx];
      }
      setAnswers((prev) => ({ ...prev, [questionIdx]: next }));
    } else {
      setAnswers((prev) => ({ ...prev, [questionIdx]: [optionIdx] }));
      setTimeout(goForward, 250);
    }
  }

  async function submitQuiz() {
    setSending(true);
    const profile = computeProfile(answers);
    try {
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, profile, answers }),
      });
    } catch {
      // Proceed to results even if email send fails
    }
    setSending(false);
    setDirection(1);
    setStep(TOTAL + 1);
  }

  function reset() {
    setDirection(-1);
    setStep(-1);
    setAnswers({});
    setEmail("");
    setConsent(true);
    setActiveDay(0);
  }

  /* Slide transition variants — direction drives left vs right */
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir * SLIDE.offsetX,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir * -SLIDE.offsetX,
      opacity: 0,
    }),
  };
  const slideTransition = { duration: SLIDE.duration, ease: SLIDE.ease };

  function renderScreen() {
    /* ── Intro ── */
    if (step === -1) {
      return (
        <motion.div
          key="intro"
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            Eje intestino / cerebro / piel
          </p>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
            Queremos entender cómo se ha estado sintiendo tu{" "}
            <span className="text-muted-foreground">cuerpo</span> últimamente.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Respondé unas preguntas rápidas para personalizar tu experiencia MicroCore.
          </p>
          <div className="QuizSheet-nav">
            <motion.button
              type="button"
              className="QuizSheet-btn QuizSheet-btnPrimary is-full"
              whileTap={{ scale: SELECTION.tapScale }}
              transition={SELECTION.spring}
              onClick={() => { setDirection(1); setStep(0); }}
            >
              Comenzar
            </motion.button>
          </div>
        </motion.div>
      );
    }

    /* ── Questions ── */
    if (step >= 0 && step < TOTAL) {
      const q = QUESTIONS[step];
      const sel = answers[step] || [];

      return (
        <motion.div
          key={`q-${step}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
        >
          <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {q.kicker}
          </p>
          <h2 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
            {q.title}
          </h2>
          {q.sub && (
            <p className="mt-2 text-sm font-medium text-muted-foreground">{q.sub}</p>
          )}
          <div className="mt-6 flex flex-col gap-2.5">
            {q.options.map((opt, i) => (
              <motion.button
                key={i}
                type="button"
                className={`QuizSheet-opt ${sel.includes(i) ? "is-selected" : ""}`}
                data-multi={String(q.multi)}
                onClick={() => selectOption(step, i)}
                initial={{ opacity: 0, y: OPTIONS.offsetY }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...OPTIONS.spring,
                  delay: i * OPTIONS.stagger,
                }}
                whileTap={{ scale: SELECTION.tapScale }}
              >
                <motion.span
                  className="QuizSheet-mark"
                  animate={sel.includes(i) ? { scale: 1 } : { scale: 1 }}
                >
                  <motion.span
                    style={{ display: "flex" }}
                    initial={false}
                    animate={sel.includes(i) ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
                    transition={SELECTION.spring}
                  >
                    {CHECK_SVG}
                  </motion.span>
                </motion.span>
                <span>{opt.t}</span>
              </motion.button>
            ))}
          </div>
          {q.multi && (
            <div className="QuizSheet-nav">
              <span className="flex-1" />
              <motion.button
                type="button"
                className="QuizSheet-btn QuizSheet-btnPrimary"
                disabled={sel.length === 0}
                whileTap={{ scale: SELECTION.tapScale }}
                transition={SELECTION.spring}
                onClick={goForward}
              >
                Continuar
              </motion.button>
            </div>
          )}
        </motion.div>
      );
    }

    /* ── Email ── */
    if (step === TOTAL) {
      return (
        <motion.div
          key="email"
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
        >
          <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Último paso
          </p>
          <h2 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
            ¿Dónde querés recibir tu{" "}
            <span className="text-muted-foreground">perfil personalizado</span>{" "}
            MicroCore?
          </h2>
          <div className="mt-6">
            <motion.input
              type="email"
              className="QuizSheet-emailInput"
              placeholder="Ingresá tu email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ...OPTIONS.spring }}
            />
          </div>
          <label className="QuizSheet-check mt-4">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span className="QuizSheet-checkBox">{CHECK_SVG}</span>
            <span className="text-sm text-muted-foreground leading-snug">
              Quiero recibir inspiración wellness, novedades y contenido educativo de
              MicroCore.
            </span>
          </label>
          <div className="QuizSheet-nav">
            <span className="flex-1" />
            <motion.button
              type="button"
              className="QuizSheet-btn QuizSheet-btnPrimary"
              disabled={!isValidEmail(email.trim()) || sending}
              whileTap={{ scale: SELECTION.tapScale }}
              transition={SELECTION.spring}
              onClick={submitQuiz}
            >
              {sending ? "Enviando..." : "Ver mi perfil"}
            </motion.button>
          </div>
        </motion.div>
      );
    }

    /* ── Results ── */
    const profile = computeProfile(answers);
    const r = RESULTS[profile];
    const menu = MENUS[profile];

    return (
      <motion.div
        key="result"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={slideTransition}
      >
        <motion.p
          className="mb-3 font-mono text-xs font-medium italic text-muted-foreground tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: RESULT_TIMING.crest, duration: 0.4 }}
        >
          {r.crest}
        </motion.p>
        <motion.h2
          className="text-xl font-semibold leading-tight tracking-tight md:text-2xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: RESULT_TIMING.title, ...RESULT_SPRING }}
        >
          {r.title}
        </motion.h2>
        <motion.p
          className="mt-4 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: RESULT_TIMING.lead, duration: 0.4 }}
        >
          {r.lead}
        </motion.p>

        <div className="QuizSheet-pillars mt-6">
          {r.pillars.map((p, i) => (
            <motion.div
              key={p}
              className="QuizSheet-pillar"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: RESULT_TIMING.pillars + i * RESULT_TIMING.pillarStagger,
                ...RESULT_SPRING,
              }}
            >
              <span className="QuizSheet-pillarDot" />
              {p}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="QuizSheet-closing mt-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: RESULT_TIMING.closing, ...RESULT_SPRING }}
        >
          {r.closing}
        </motion.div>

        {/* 7-day menu */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: RESULT_TIMING.menu, ...RESULT_SPRING }}
        >
          <p className="mb-1 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Incluido en tu perfil
          </p>
          <h3 className="text-lg font-semibold tracking-tight">
            Tu menú de 7 días con MicroCore
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{menu.intro}</p>

          <div className="QuizSheet-tabs mt-4">
            {menu.days.map((_, di) => (
              <button
                key={di}
                type="button"
                className={`QuizSheet-tab ${activeDay === di ? "is-on" : ""}`}
                onClick={() => setActiveDay(di)}
              >
                Día {di + 1}
              </button>
            ))}
          </div>

          {menu.days.map((day, di) => (
            <div
              key={di}
              className="mt-2 flex flex-col gap-2.5"
              style={{ display: activeDay === di ? "flex" : "none" }}
            >
              {day.m.map((meal, mi) => (
                <div
                  key={mi}
                  className={`QuizSheet-meal ${mi === day.mc ? "is-mc" : ""}`}
                >
                  <span className="QuizSheet-mealWhen">{MEAL_LABELS[mi]}</span>
                  <span className="QuizSheet-mealTxt">
                    {mi === day.mc ? <BoldMicroCore text={meal} /> : meal}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>

        <div className="QuizSheet-nav mt-6">
          <button
            type="button"
            className="QuizSheet-btn QuizSheet-btnGhost text-sm underline underline-offset-2"
            onClick={reset}
          >
            Empezar de nuevo
          </button>
        </div>

        <p className="QuizSheet-footnote mt-6">
          {email && <>Enviaremos tu perfil y menú a {email}.<br /></>}
          Menú orientativo de bienestar. MicroCore es un complemento alimentario: no
          reemplaza una dieta variada ni el consejo de un profesional de la salud.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="QuizSheet-body">
      <div className="QuizSheet-wrap">
        <TopBar step={step} onBack={goBack} />
        {(step >= 0 && step <= TOTAL) && (
          <div className="QuizSheet-progress">
            <motion.div
              className="QuizSheet-progressBar"
              animate={{ width: `${progress}%` }}
              transition={PROGRESS.spring}
            />
          </div>
        )}
        <div className="QuizSheet-stage">
          <AnimatePresence mode="wait" custom={direction}>
            {renderScreen()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Exported compound component ─── */

export function QuizSheet({ children }: { children: React.ReactNode }) {
  return (
    <QuizSheetRoot>
      {children}
      <Sheet.Portal>
        <QuizSheetView>
          <QuizSheetBackdrop />
          <QuizSheetContent>
            <QuizBody />
          </QuizSheetContent>
        </QuizSheetView>
      </Sheet.Portal>
    </QuizSheetRoot>
  );
}

export const QuizSheetTrigger = Sheet.Trigger;
