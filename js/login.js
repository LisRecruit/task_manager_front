import { post, redirect } from "./httpMethods.js";

export async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
           const data = await post("auth/login", { username, password });

           localStorage.setItem("token", data.token);
           localStorage.setItem("role", data.role);

           if (data.role === "ROLE_ADMIN") {
               redirect("../pages/admin_dashboard.html");
           } else {
               redirect("pages/main_page.html");
           }

       } catch (e) {
           document.getElementById("error").innerText = "Wrong username or password";
       }

}

async function registrationRedirect() {
        redirect("../pages/registration.html");
}

window.login = login;
window.registrationRedirect = registrationRedirect;
