import { post, redirect, buildUrl } from ".httpMethods.js";

async function login() {
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
           const data = await post(buildUrl("login"), { email, password });

           localStorage.setItem("token", data.token);
           localStorage.setItem("role", data.role);

           if (data.role === "ROLE_ADMIN") {
               redirect("admin_dashboard.html");
           } else {
               redirect("main_page.html");
           }

       } catch (e) {
           document.getElementById("error").innerText = "Wrong username or password";
       }

}

async function reistration() {
        redirect("../pages/registration.html");
}
