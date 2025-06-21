export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/genai/genkitAI");

    // try {
    //   const data = await genkitAI.extractData("Pago de prueba por 2000, AFC");
    //   console.log("Extracted data:", data);
    // } catch (e) {
    //   console.error("Error extracting data:", e);
    // }
    console.log("Genkit AI module loaded successfully.");
  }
}
