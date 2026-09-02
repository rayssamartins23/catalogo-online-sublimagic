// Credenciais do Supabase
const SUPABASE_URL = "https://eruqmvgdjactbefhammr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FNv0l4ymo_ELn5Ul5GpxeA_KvwKDIdu";

// Obtém o cliente de forma segura evitando problemas de inicialização
const supabaseLib = window.supabase || supabase;
const supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Credenciais de acesso ao painel
const ADMIN_USUARIO = "luluzinha";
const ADMIN_SENHA = "12345678"; 


document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const loginContainer = document.getElementById("login-container");
  const adminPanel = document.getElementById("admin-panel");

  // 1. Evento de Autenticação (Login)
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const userTyped = document.getElementById("admin-user").value;
      const passTyped = document.getElementById("admin-pass").value;

      if (userTyped === ADMIN_USUARIO && passTyped === ADMIN_SENHA) {
        alert("Login efetuado com sucesso!");
        loginContainer.style.display = "none";
        adminPanel.style.display = "block";
      } else {
        alert("Usuário ou senha incorretos!");
      }
    });
  }

  // 2. Evento de Cadastro de Produto no Supabase
  const productForm = document.getElementById("product-form");
  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("p-name").value;
      const price = parseFloat(document.getElementById("p-price").value);
      const fileInput = document.getElementById("p-image-file");
      const file = fileInput && fileInput.files ? fileInput.files[0] : null;

      try {
        let imageUrl = "";

        // Se um arquivo for selecionado, envia para o bucket 'produtos'
        if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabaseClient.storage
            .from('produtos')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Obtém a URL pública da imagem enviada
          const { data: urlData } = supabaseClient.storage
            .from('produtos')
            .getPublicUrl(fileName);

          imageUrl = urlData.publicUrl;
        }

        // Insere o registro na tabela 'produtos'
        const { error: insertError } = await supabaseClient
          .from("produtos")
          .insert([
            {
              name: name,
              price: price,
              image_url: imageUrl
            }
          ]);

        if (insertError) throw insertError;

        alert("Produto cadastrado com sucesso!");
        productForm.reset();
      } catch (error) {
        console.error("Erro ao cadastrar produto: ", error);
        alert("Erro ao cadastrar produto: " + (error.message || error));
      } 
    });
  }
});