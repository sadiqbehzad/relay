// // quotes api

// document.addEventListener("click", function(event){
//   if(!event.target.matches("#button")) return;

// fetch("https://type.fit/api/quotes")
//   .then(function(response) {
//     return response.json();
//   })
//   .then(function(data) {
//     console.log(data);

//     const randomQuote= Math.floor(Math.random() * data.length);

//   document.getElementById('quote').innerHTML=data[randomQuote].text +" " +data[randomQuote].author
//   });
// })

//Example of google translate API

const { Translate } = require("@google-cloud/translate").v2;

// Set up translation client
const translate = new Translate({
  projectId: "YOUR_PROJECT_ID",
  keyFilename: ".garden_loftwelcomePage.html.json",
});

// Function to translate text
async function translateText(text, targetLanguage) {
  try {
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Return original text on error
  }
}

// Example usage
const translatedText = await translateText("Hello, world!", "es");
console.log(translatedText);
