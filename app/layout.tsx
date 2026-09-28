import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { TweaksProvider } from "@/context/TweaksContext";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chong Ming Li — Software Developer · Data Scientist",
  description: "Personal portfolio. Stage select.",
  icons: { icon: "/favicon.png" },
};

// Runs before first paint. Flags <html data-lite> when the page renders in
// software (no WebGL, or a CPU renderer like SwiftShader/llvmpipe), or when a
// frame-time probe over the first 15s sees sustained lag (catches weak GPUs too).
// The Tweaks "Lite Mode" setting overrides it: "on"/"off" skip detection entirely.
// The probe's verdict is kept as data-lite-auto so switching back to Auto restores it.
const LITE_PROBE = `(function(){
var d=document.documentElement,mode=function(){try{return JSON.parse(localStorage.getItem("portfolio.tweaks")||"{}").lite||"auto"}catch(e){return "auto"}};
var m=mode();if(m==="on")d.dataset.lite="";if(m!=="auto")return;
var lite=function(){d.dataset.liteAuto="";if(mode()==="auto")d.dataset.lite=""};
try{var g=document.createElement("canvas").getContext("webgl");
if(!g)lite();else{var r=String(g.getParameter(g.RENDERER)),x=g.getExtension("WEBGL_debug_renderer_info");
if(x)r+=g.getParameter(x.UNMASKED_RENDERER_WEBGL);
if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r))lite();
var l=g.getExtension("WEBGL_lose_context");if(l)l.loseContext();}}catch(e){}
var t=performance.now(),end=t+15000,n=0,slow=0;
requestAnimationFrame(function f(now){
if("liteAuto" in d.dataset)return;
if(now-t>40)slow++;t=now;
if(++n===60){if(slow>20)return lite();n=slow=0}
if(now<end&&!document.hidden)requestAnimationFrame(f)})})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivoBlack.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LITE_PROBE }} />
      </head>
      <body data-palette="purple">
        <TweaksProvider>{children}</TweaksProvider>
      </body>
    </html>
  );
}
