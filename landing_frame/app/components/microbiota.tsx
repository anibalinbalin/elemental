"use client";

import { VisuallyHidden } from "@silk-hq/components";
import { SectionReveal } from "./section-reveal";
import { PlaceholderImage } from "./placeholder-image";
import { LongSheet } from "./silk-long-sheet";

const nutritionFacts = [
  { nutrient: "Valor energético", amount: "50 kcal", dailyValue: "3" },
  { nutrient: "Carbohidratos", amount: "6,3 g", dailyValue: "2" },
  { nutrient: "Azúcares", amount: "0,24 g", dailyValue: "-" },
  { nutrient: "Proteínas", amount: "4,6 g", dailyValue: "6" },
  { nutrient: "Grasas totales", amount: "0,0 g", dailyValue: "0" },
  { nutrient: "Fibra alimentaria", amount: "2,7 g", dailyValue: "11" },
  { nutrient: "Sodio", amount: "15 mg", dailyValue: "1" },
];

function IconDigestion({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg viewBox="0 0 68.08 81.18" xmlns="http://www.w3.org/2000/svg" style={{ width: "83.84%", height: "99.98%", left: "16.16%", top: "0%", overflow: "visible", position: "absolute" }}>
        <path d="M68.080 34.830C68.080 31.330 66.720 28.030 64.230 25.550C61.750 23.070 58.450 21.700 54.950 21.700C54.950 21.700 36.250 21.700 36.250 21.700C38.730 19.430 40.170 16.210 40.170 12.800C40.170 12.800 40.170 1.590 40.170 1.590C40.170 0.710 39.450 0.000 38.580 0.000C37.710 0.000 36.990 0.720 36.990 1.590C36.990 1.590 36.990 12.800 36.990 12.800C36.990 17.710 33.000 21.700 28.090 21.700C28.090 21.700 1.590 21.700 1.590 21.700C0.710 21.700 0.000 22.420 0.000 23.290C0.000 24.160 0.720 24.880 1.590 24.880C1.590 24.880 54.960 24.880 54.960 24.880C60.440 24.880 64.900 29.340 64.900 34.820C64.900 40.300 60.440 44.760 54.960 44.760C54.960 44.760 7.590 44.760 7.590 44.760C6.710 44.760 6.000 45.470 6.000 46.350C6.000 47.230 6.720 47.940 7.590 47.940C7.590 47.940 48.960 47.940 48.960 47.940C54.440 47.940 58.900 52.400 58.900 57.880C58.900 63.360 54.440 67.820 48.960 67.820C48.960 67.820 31.860 67.820 31.860 67.820C29.540 67.820 27.640 69.720 27.640 72.040C27.640 72.040 27.640 79.590 27.640 79.590C27.640 80.470 28.350 81.180 29.230 81.180C30.110 81.180 30.820 80.460 30.820 79.590C30.820 79.590 30.820 72.040 30.820 72.040C30.820 71.470 31.280 71.010 31.850 71.010C31.850 71.010 48.950 71.010 48.950 71.010C56.190 71.010 62.080 65.120 62.080 57.880C62.080 53.900 60.300 50.200 57.250 47.720C63.440 46.630 68.080 41.230 68.080 34.810C68.080 34.810 68.080 34.830 68.080 34.830Z" fill="currentColor" fillRule="evenodd" />
      </svg>
      <svg viewBox="0 0 68.08 81.2" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "83.84%", height: "100%", left: "0%", top: "0%", overflow: "visible", position: "absolute" }}>
        <path d="M62.080 57.890C62.080 57.010 61.370 56.300 60.490 56.300C60.490 56.300 19.120 56.300 19.120 56.300C13.640 56.300 9.180 51.840 9.180 46.360C9.180 40.880 13.640 36.420 19.120 36.420C19.120 36.420 66.490 36.420 66.490 36.420C67.370 36.420 68.080 35.700 68.080 34.830C68.080 33.960 67.370 33.240 66.490 33.240C66.490 33.240 13.120 33.240 13.120 33.240C7.640 33.240 3.180 28.780 3.180 23.300C3.180 17.820 7.640 13.360 13.120 13.360C13.120 13.360 36.230 13.360 36.230 13.360C38.550 13.360 40.450 11.470 40.450 9.140C40.450 9.140 40.450 1.590 40.450 1.590C40.450 0.710 39.740 0.000 38.860 0.000C37.980 0.000 37.270 0.720 37.270 1.590C37.270 1.590 37.270 9.140 37.270 9.140C37.270 9.710 36.810 10.170 36.240 10.170C36.240 10.170 13.130 10.170 13.130 10.170C5.890 10.170 0.000 16.060 0.000 23.300C0.000 29.720 4.650 35.120 10.840 36.210C7.790 38.690 6.010 42.390 6.010 46.370C6.010 53.610 11.900 59.500 19.140 59.500C19.140 59.500 31.840 59.500 31.840 59.500C29.360 61.780 27.920 64.990 27.920 68.400C27.920 68.400 27.920 79.610 27.920 79.610C27.920 80.490 28.640 81.200 29.510 81.200C30.380 81.200 31.100 80.480 31.100 79.610C31.100 79.610 31.100 68.400 31.100 68.400C31.100 63.490 35.090 59.500 40.000 59.500C40.000 59.500 60.500 59.500 60.500 59.500C61.380 59.500 62.090 58.790 62.090 57.910C62.090 57.910 62.080 57.890 62.080 57.890Z" fill="currentColor" fillRule="evenodd" />
      </svg>
    </div>
  );
}

function IconMood({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 148.43 46.36" width={size * 2.2} height={size * 0.69} xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <path d="M113.190 16.300C109.970 13.850 106.160 15.170 103.570 18.220C96.370 26.670 94.480 36.250 89.280 42.390C87.320 44.710 84.640 46.430 81.550 46.360C77.960 46.270 75.050 44.010 73.120 41.130C70.780 37.640 69.070 33.980 67.650 30.020C67.650 30.020 63.650 18.830 63.650 18.830C62.550 15.740 61.210 12.850 59.530 10.040C56.520 5.010 51.680 1.180 46.550 4.570C44.430 5.970 42.770 7.880 41.340 10.030C41.340 10.030 35.180 19.310 35.180 19.310C31.690 24.580 25.560 30.420 19.080 30.430C19.080 30.430 1.080 30.460 1.080 30.460C0.330 30.460 -0.100 29.220 0.020 28.690C0.200 27.920 0.910 27.290 1.880 27.280C1.880 27.280 18.360 27.200 18.360 27.200C25.990 27.160 30.780 19.970 34.610 14.260C34.610 14.260 39.690 6.690 39.690 6.690C41.080 4.620 42.940 3.000 45.070 1.650C50.590 -1.850 56.760 0.530 60.640 5.860C63.020 9.130 64.900 12.620 66.290 16.460C66.290 16.460 70.930 29.260 70.930 29.260C72.500 33.600 75.020 39.530 78.400 41.960C80.880 43.750 83.880 43.380 85.870 41.270C86.930 40.140 87.990 39.030 88.780 37.680C90.580 34.630 91.930 31.510 93.440 28.300C96.030 22.780 100.410 14.980 105.740 12.500C108.730 11.110 112.030 11.490 114.760 13.400C119.340 16.610 120.670 21.710 124.880 24.840C127.190 26.550 129.870 27.240 132.740 27.230C132.740 27.230 146.490 27.180 146.490 27.180C147.370 27.180 148.170 27.830 148.390 28.510C148.570 29.070 148.140 30.420 147.350 30.430C141.670 30.500 136.200 30.600 130.540 30.370C127.020 30.230 123.820 28.460 121.410 26.110C117.990 22.780 116.790 19.030 113.200 16.300C113.200 16.300 113.190 16.300 113.190 16.300Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

function IconInflammation({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg viewBox="0 0 3.57 19.67" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "4.17%", height: "22.99%", left: "47.91%", top: "0%", overflow: "visible", position: "absolute" }}>
        <path d="M3.571 17.717C3.591 18.887 2.631 19.617 1.981 19.667C1.131 19.727 0.001 18.817 0.001 17.917C0.001 17.917 0.001 1.747 0.001 1.747C-0.039 0.667 0.991 0.067 1.591 0.007C2.381 -0.073 3.531 0.517 3.561 1.747C3.561 1.747 3.561 17.707 3.561 17.707C3.561 17.707 3.571 17.717 3.571 17.717Z" fill="currentColor" fillRule="evenodd" />
      </svg>
      <svg viewBox="0 0 19.66 3.57" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "22.98%", height: "4.17%", left: "0%", top: "47.92%", overflow: "visible", position: "absolute" }}>
        <path d="M17.911 3.570C17.911 3.570 1.741 3.570 1.741 3.570C1.081 3.570 0.031 2.810 0.001 1.980C-0.029 0.740 0.861 0.000 1.751 0.000C1.751 0.000 17.921 0.000 17.921 0.000C18.581 0.000 19.661 0.600 19.661 1.590C19.661 2.750 18.801 3.570 17.911 3.570Z" fill="currentColor" fillRule="evenodd" />
      </svg>
      <svg viewBox="0 0 19.68 3.57" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "23.00%", height: "4.17%", left: "77.00%", top: "47.92%", overflow: "visible", position: "absolute" }}>
        <path d="M17.919 3.560C17.919 3.560 1.749 3.560 1.749 3.560C0.699 3.560 0.069 2.570 0.009 1.970C-0.071 1.180 0.399 0.000 1.759 0.000C1.759 0.000 17.929 0.000 17.929 0.000C18.889 0.000 19.609 0.990 19.669 1.600C19.749 2.390 19.269 3.570 17.919 3.570C17.919 3.570 17.919 3.560 17.919 3.560Z" fill="currentColor" fillRule="evenodd" />
      </svg>
      <svg viewBox="0 0 3.57 19.66" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "4.17%", height: "22.98%", left: "47.91%", top: "77.02%", overflow: "visible", position: "absolute" }}>
        <path d="M3.570 17.710C3.570 18.600 2.930 19.680 1.980 19.660C0.820 19.640 0.000 18.810 0.000 17.910C0.000 17.910 0.000 1.740 0.000 1.740C0.000 1.080 0.580 0.000 1.590 0.000C2.730 0.000 3.560 0.860 3.560 1.740C3.560 1.740 3.560 17.700 3.560 17.700C3.560 17.700 3.570 17.710 3.570 17.710Z" fill="currentColor" fillRule="evenodd" />
      </svg>
      <svg viewBox="0 0 14.13 14.24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "16.52%", height: "16.65%", left: "14.74%", top: "14.62%", overflow: "visible", position: "absolute" }}>
        <path d="M13.765 11.394C14.285 11.914 14.285 13.164 13.535 13.884C12.865 14.514 11.625 14.214 11.165 13.754C11.165 13.754 0.395 2.974 0.395 2.974C-0.055 2.524 -0.155 1.064 0.275 0.624C1.125 -0.266 2.285 -0.106 2.885 0.494C2.885 0.494 13.765 11.384 13.765 11.384C13.765 11.384 13.765 11.394 13.765 11.394Z" fill="currentColor" fillRule="evenodd" />
      </svg>
      <svg viewBox="0 0 14.24 14.2" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "16.64%", height: "16.60%", left: "68.71%", top: "14.65%", overflow: "visible", position: "absolute" }}>
        <path d="M3.113 13.617C2.213 14.407 1.163 14.297 0.633 13.847C-0.007 13.317 -0.347 11.927 0.523 11.247C0.523 11.247 11.283 0.477 11.283 0.477C12.063 -0.243 13.173 -0.033 13.643 0.357C14.293 0.897 14.513 2.177 13.763 2.967C13.763 2.967 3.123 13.617 3.123 13.617C3.123 13.617 3.113 13.617 3.113 13.617Z" fill="currentColor" fillRule="evenodd" />
      </svg>
      <svg viewBox="0 0 14.14 14.15" xmlns="http://www.w3.org/2000/svg" style={{ width: "16.53%", height: "16.54%", left: "14.65%", top: "68.81%", overflow: "visible", position: "absolute" }}>
        <path d="M3.064 13.573C2.474 14.173 1.134 14.393 0.584 13.803C-0.216 12.963 -0.136 11.813 0.474 11.203C0.474 11.203 11.234 0.433 11.234 0.433C11.684 -0.017 13.054 -0.207 13.594 0.313C14.284 0.983 14.314 2.313 13.714 2.923C13.714 2.923 3.074 13.573 3.074 13.573C3.074 13.573 3.064 13.573 3.064 13.573Z" fill="currentColor" fillRule="evenodd" />
      </svg>
      <svg viewBox="0 0 14.18 14.24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "16.57%", height: "16.64%", left: "68.79%", top: "68.74%", overflow: "visible", position: "absolute" }}>
        <path d="M13.811 11.390C14.331 11.910 14.331 13.250 13.581 13.880C12.831 14.510 11.671 14.210 11.211 13.750C11.211 13.750 0.441 2.970 0.441 2.970C-0.009 2.520 -0.219 1.190 0.321 0.620C1.151 -0.260 2.331 -0.110 2.931 0.490C2.931 0.490 13.811 11.380 13.811 11.380C13.811 11.380 13.811 11.390 13.811 11.390Z" fill="currentColor" fillRule="evenodd" />
      </svg>
    </div>
  );
}

function IconEnergy({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 56.73 85.01" width={size * 0.67} height={size} xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <path d="M14.709 84.372C13.909 84.962 12.949 85.132 12.429 84.932C11.749 84.672 11.419 83.522 11.559 82.952C11.559 82.952 19.899 48.762 19.899 48.762C19.899 48.762 1.759 48.802 1.759 48.802C1.759 48.802 0.859 48.612 0.379 48.132C0.069 47.822 -0.171 46.972 0.159 46.222C0.159 46.222 33.069 0.862 33.069 0.862C33.609 0.392 34.079 -0.238 35.069 0.092C36.059 0.422 36.319 1.262 36.319 1.812C36.319 1.812 36.319 27.532 36.319 27.532C36.319 27.532 54.929 27.502 54.929 27.502C54.929 27.502 55.889 27.632 56.309 28.172C56.579 28.512 56.979 29.272 56.529 30.102C56.529 30.102 14.719 84.382 14.719 84.382C14.719 84.382 14.709 84.372 14.709 84.372ZM17.319 75.082C17.319 75.082 51.289 31.092 51.289 31.092C51.289 31.092 34.489 31.072 34.489 31.072C33.669 30.962 32.879 30.172 32.779 29.332C32.779 29.332 32.709 7.402 32.709 7.402C32.709 7.402 5.259 45.212 5.259 45.212C5.259 45.212 22.179 45.242 22.179 45.242C23.239 45.352 23.989 46.262 23.879 47.372C23.879 47.372 17.329 75.082 17.329 75.082C17.329 75.082 17.319 75.082 17.319 75.082Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

function IconSkin({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 95.13 1" preserveAspectRatio="none" width={size * 2} height={1} xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <path d="M0.000 0.000C0.000 0.000 95.130 0.000 95.130 0.000" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const features = [
  { label: "Digestion", icon: IconDigestion },
  { label: "Estado\nde animo", icon: IconMood },
  { label: "Inflamacion", icon: IconInflammation },
  { label: "Energia", icon: IconEnergy },
  { label: "Piel", icon: IconSkin },
];

export function Microbiota() {
  return (
    <section id="microbiota" className="bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
          <SectionReveal>
            <div className="flex flex-col gap-8">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                Todo empieza en la
                <br />
                microbiota
              </h2>

              <p className="text-muted-foreground leading-relaxed max-w-lg">
                La microbiota intestinal participa en procesos clave del cuerpo:
              </p>

              <div className="flex flex-wrap gap-6 lg:gap-8">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.label}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="h-8 flex items-center justify-center">
                        <Icon />
                      </div>
                      <span className="text-[11px] font-medium text-foreground uppercase tracking-widest text-center whitespace-pre-line leading-tight">
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-muted-foreground leading-relaxed max-w-lg">
                Cuando ese equilibrio se altera, el cuerpo lo siente.
                <br />
                <span className="font-bold text-foreground">MICROCORE</span> fue
                disenado para apoyar ese equilibrio.
              </p>

              <div>
                <LongSheet.Root>
                  <LongSheet.Trigger asChild>
                    <button
                      type="button"
                      className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors cursor-pointer"
                    >
                      Ver formula
                    </button>
                  </LongSheet.Trigger>
                  <LongSheet.Portal>
                    <LongSheet.View>
                      <LongSheet.Backdrop />
                      <LongSheet.Content>
                        <article className="ExampleLongSheet-article">
                          <LongSheet.Trigger action="dismiss" asChild>
                            <button className="ExampleLongSheet-dismissTrigger">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ExampleLongSheet-dismissIcon"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                              <VisuallyHidden.Root>Cerrar</VisuallyHidden.Root>
                            </button>
                          </LongSheet.Trigger>
                          <div className="ExampleLongSheet-articleContent">
                            <LongSheet.Title className="ExampleLongSheet-title" asChild>
                              <h1>Formula MICROCORE</h1>
                            </LongSheet.Title>
                            <h2 className="ExampleLongSheet-subtitle">
                              Una sola cucharada. Cinco funciones.
                            </h2>
                            <section className="ExampleLongSheet-articleBody">
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Ingredientes
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph">
                                  Açaí en polvo, gelatina bovina hidrolizada
                                  (colágeno), maltodextrina, inulina,
                                  oligofructosa, extracto de maca, extracto de
                                  melena de león, probiótico: Bacillus coagulans
                                  GBI-30 6086, gluconato de zinc, acidulante:
                                  ácido cítrico (INS 330).
                                </p>
                              </div>

                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Información nutricional
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph text-base text-gray-600">
                                  Porción: 20 g en 200 mL de agua (1 vaso)
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                  <table className="w-full border-collapse text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-300">
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-950" />
                                        <th className="px-4 py-2.5 text-right font-semibold text-gray-950">
                                          Cantidad
                                        </th>
                                        <th className="w-16 px-4 py-2.5 text-right font-semibold text-gray-950">
                                          %VD
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {nutritionFacts.map((item) => (
                                        <tr key={item.nutrient}>
                                          <td className="px-4 py-2.5 text-gray-800">
                                            {item.nutrient}
                                          </td>
                                          <td className="px-4 py-2.5 text-right text-gray-800">
                                            {item.amount}
                                          </td>
                                          <td className="px-4 py-2.5 text-right text-gray-500">
                                            {item.dailyValue}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <p className="ExampleLongSheet-articleParagraph text-sm text-gray-500">
                                  *% Valores diarios con base a una dieta de
                                  2.000 kcal.
                                </p>
                              </div>

                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Modo de uso
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph">
                                  1 dosis diaria sugerida en 200 mL de agua.
                                  Disolver 20 gramos del polvo. Se sugiere
                                  consumir una dosis diaria.
                                </p>
                              </div>

                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Almacenamiento
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph">
                                  Almacenar al resguardo de la luz, en lugar
                                  fresco y seco. Almacenar en el envase original.
                                </p>
                              </div>

                              <div className="flex gap-3">
                                <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-center">
                                  <p className="text-lg font-bold text-gray-950">
                                    1 x 10<sup>9</sup> UFC
                                  </p>
                                  <p className="mt-1 text-xs leading-snug text-gray-500">
                                    por porción de producto de
                                    B.&nbsp;coagulans GBI&#8209;30&nbsp;6086
                                  </p>
                                </div>
                                <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-center">
                                  <p className="text-lg font-bold text-gray-950">
                                    1.76 Mg
                                  </p>
                                  <p className="mt-1 text-xs leading-snug text-gray-500">
                                    De Zinc aporta por porción
                                  </p>
                                </div>
                              </div>
                            </section>
                          </div>
                        </article>
                      </LongSheet.Content>
                    </LongSheet.View>
                  </LongSheet.Portal>
                </LongSheet.Root>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <PlaceholderImage
              className="w-[420px] h-[420px] lg:w-[480px] lg:h-[480px] rounded-full"
              aspectRatio="1/1"
              label="Microbiota"
            />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
