/**
 * Prints the specified text to the console.
 *
 * @param {string} text - The text to be printed. Defaults to an empty string.
 */
export const print = (text = "") => {
  const consoleElement = document.querySelector("#console");
  const lineDiv = document.createElement("div");
  lineDiv.innerHTML = `> ${text}`;
  lineDiv.classList.add("console-line");

  consoleElement.appendChild(lineDiv);

  consoleElement.scrollTop = consoleElement.scrollHeight;
};
