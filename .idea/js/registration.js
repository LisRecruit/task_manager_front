import { post, redirect, buildUrl } from ".httpMethods.js";

async function registration() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeatPassword").value;

    try {
        const data = await post(buildUrl("registration"),
            {username,password, repeatPassword});
        redirect("../pages/login.html");

    } catch (e) {
        document.getElementById("error").innerText = "Registration failed";
    }
}