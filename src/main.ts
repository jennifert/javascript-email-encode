// ------------------------------------------------------------
//  style import (keep if you have a CSS file for the page)
// ------------------------------------------------------------
import "./pico.classless.css";
import "./style.css";

/* ------------------------------------------------------------------
   1️⃣  Email address validator
   ------------------------------------------------------------------ */
function isValidEmail(email: string): boolean {
    // Remove surrounding whitespace
    email = email.trim();

    // Simple but effective pattern – it matches the usual local‑part@domain.tld
    // Note: the back‑slashes are escaped because we are inside a string literal.
    const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    // Disallow consecutive dots anywhere (e.g. "john..doe@example.com")
    if (email.includes("..")) return false;

    return re.test(email);
}

/* ------------------------------------------------------------------
   2️⃣  Helper: “valid or empty”
   ------------------------------------------------------------------ */
function isValidOrEmptyEmail(label: string, value: string): boolean {
    // Empty string → treat as “no address supplied”, which is fine.
    if (!value) return true;

    // Non‑empty – check the format
    if (isValidEmail(value)) return true;

    // Invalid → log a warning and signal failure
    console.warn(`Invalid ${label} address:`, value);
    return false;
}

/* ------------------------------------------------------------------
   3️⃣  Encode a piece of text for the mailto URL
   ------------------------------------------------------------------ */
function encodeForMailto(value: string): string {
    // encodeURIComponent handles accents, spaces, new‑lines (%0D%0A), etc.
    return encodeURIComponent(value);
}

/* ------------------------------------------------------------------
   4️⃣  Build the complete mailto URL
   ------------------------------------------------------------------ */
interface MailOptions {
    to: string;               // required
    cc?: string;              // optional
    bcc?: string;             // optional
    subject?: string;         // optional
    body?: string;            // optional
}

interface BuildResult {
    url?: string;     // valid mailto link
    error?: string;   // validation error
}

function buildMailtoUrl(opts: MailOptions): BuildResult {
    const { to, cc = "", bcc = "", subject = "", body = "" } = opts;

    if (!isValidEmail(to)) {
        return { error: "❌ Invalid primary e-mail address." };
    }

    if (!isValidOrEmptyEmail("CC", cc)) {
        return { error: "❌ Invalid CC address." };
    }

    if (!isValidOrEmptyEmail("BCC", bcc)) {
        return { error: "❌ Invalid BCC address." };
    }

    let url = "mailto:" + to.trim();
    const params: string[] = [];

    if (subject) params.push("subject=" + encodeForMailto(subject));
    if (body) params.push("body=" + encodeForMailto(body));
    if (cc) params.push("cc=" + encodeForMailto(cc));
    if (bcc) params.push("bcc=" + encodeForMailto(bcc));

    if (params.length) url += "?" + params.join("&");

    return { url };
}


/* ------------------------------------------------------------------
   5️⃣  code to build email URL from form input
   ------------------------------------------------------------------ */
const form = document.getElementById("email-encode") as HTMLFormElement;

const mailtoLink = document.getElementById("mailtoLink") as HTMLTextAreaElement;
const copyBtn = document.getElementById("copyLink") as HTMLButtonElement;
const resultDiv = document.getElementById("result") as HTMLDivElement;

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const toInput = document.getElementById("txtTo") as HTMLInputElement;
    const ccInput = document.getElementById("txtCc") as HTMLInputElement;
    const bccInput = document.getElementById("txtBcc") as HTMLInputElement;
    const subjectInput = document.getElementById("txtSubject") as HTMLInputElement;
    const bodyInput = document.getElementById("txtBody") as HTMLTextAreaElement;

    resultDiv.textContent = ""; // clear previous errors

    const mailOptions = {
        to: toInput.value.trim(),
        cc: ccInput.value.trim(),
        bcc: bccInput.value.trim(),
        subject: subjectInput.value.trim(),
        body: bodyInput.value.trim(),
    };

    const { url, error } = buildMailtoUrl(mailOptions);

    if (url) {
        mailtoLink.value = url;
        resultDiv.textContent = "✅ Mailto URL generated successfully!";
        resultDiv.style.color = "green";
    } else if (error) {
        mailtoLink.value = "";
        resultDiv.textContent = error;
        resultDiv.style.color = "red";
    }
});


copyBtn.addEventListener("click", () => {
    mailtoLink.select();
    mailtoLink.setSelectionRange(0, 99999);
    document.execCommand("copy");

    resultDiv.textContent = "📋 Copied to clipboard!";
    resultDiv.style.color = "blue";

    // Optional: clear message after 3 seconds
    setTimeout(() => resultDiv.textContent = "", 5000);
});


