export type Locale = "es" | "en";

const es = {
  common: {
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    add: "Agregar",
  },
  nav: {
    howItWorks: "Cómo funciona",
    pricing: "Precios",
    login: "Inicia sesión",
    startFree: "Empieza gratis",
  },
  hero: {
    badge: "Menú digital para restaurantes",
    title: "El menú de tu restaurante, siempre actualizado.",
    description:
      "Crea una landing y un menú digital con código QR en minutos. Edita platos y precios desde tu panel, sin reimprimir nada.",
    ctaPrimary: "Crea tu menú gratis",
    ctaSecondary: "Cómo funciona",
  },
  howItWorks: {
    heading: "Cómo funciona",
    subheading: "Crea el menú de tu restaurante de forma fácil y sin complicaciones",
    steps: [
      {
        title: "Crea tu restaurante",
        description:
          "Crea el perfil de tu restaurante y compártelo mediante link o código QR.",
      },
      {
        title: "Personaliza tu marca",
        description:
          "Elige el color y el logo de tu restaurante para que el menú se vea como tuyo.",
      },
      {
        title: "Crea tu menú",
        description: "Carga cada plato con fotos, precios, descripciones y etiquetas.",
      },
      {
        title: "Configura tu WhatsApp",
        description: "Conecta tu número para recibir los pedidos directo en tu chat.",
      },
      {
        title: "Comparte tu QR",
        description:
          "Tus clientes escanean el código en la mesa y ven el menú al instante.",
      },
      {
        title: "Actualiza en tiempo real",
        description:
          "Marca un plato como agotado o cambia un precio y se refleja al instante.",
      },
    ],
  },
  pricingSection: {
    heading: "Selecciona tu plan y continúa",
    subheading:
      "Empieza con 15 días gratis o activa de una vez el plan mensual o anual, sin tarifas ocultas.",
    mostPopular: "Más popular",
  },
  faq: {
    heading: "Preguntas frecuentes",
    subheading: "Explora las dudas más comunes y descubre cómo funciona Levery.",
    items: [
      {
        question: "Tengo un emprendimiento, ¿igual puedo registrarme?",
        answer:
          "Claro que sí. Levery fue pensada para restaurantes grandes, medianos y pequeños, y también para emprendimientos que están empezando.",
      },
      {
        question: "¿Puedo marcar un plato que ya no tengo disponible?",
        answer:
          "Sí. Desde tu panel puedes marcar cualquier plato como agotado con un clic, o eliminarlo por completo si ya no lo vas a ofrecer.",
      },
      {
        question: "¿Puedo probar antes de pagar?",
        answer:
          "¡Claro! Tienes 15 días gratis para conocer la app y probar todas sus funciones. Si te gusta (seguro que sí), activas tu suscripción cuando quieras.",
      },
      {
        question: "¿Puedo actualizar mi menú cuando quiera?",
        answer:
          "Sí. Ingresas a tu cuenta, haces los cambios y se actualizan al instante. Tú decides cuándo cambiar precios, fotos o platos, sin depender de nadie.",
      },
      {
        question: "¿Tengo que saber de diseño o programación?",
        answer:
          "Para nada. Levery es tan fácil de usar como llenar un formulario. Subes tus platos, pones precios, eliges tu color de marca... ¡y listo! Menú digital al instante.",
      },
      {
        question: "¿Necesito una computadora o puedo hacerlo desde el celular?",
        answer:
          "Puedes usar Levery desde donde te quede más cómodo: celular, tablet o computadora. ¡Tú eliges!",
      },
      {
        question: "¿Puedo agregar fotos de mis platos?",
        answer:
          "¡Claro! Las fotos hacen que tu menú se vea más apetitoso y profesional. Puedes subirlas directamente desde tu galería.",
      },
      {
        question: "¿Puedo organizar mi menú por categorías?",
        answer:
          "Sí. Puedes crear las categorías que necesites (Entradas, Postres, Bebidas, o lo que quieras) y ordenarlas como prefieras. Todo bien organizado para tus clientes.",
      },
      {
        question: "¿Mi menú tiene un link único?",
        answer:
          "Sí. Tendrás un enlace personalizado con el nombre de tu restaurante para compartir por WhatsApp, Instagram o donde quieras. También puedes imprimir tu código QR.",
      },
      {
        question: "¿Puedo destacar promociones o platos del día?",
        answer:
          "Sí. Puedes marcar cualquier plato como destacado para que resalte en tu menú, ideal para promociones o platos del día.",
      },
    ],
  },
  testimonials: {
    label: "Testimonios",
    heading: "Restaurantes que ya digitalizaron su menú",
    items: [
      {
        quote:
          "Armé el menú completo en una tarde y coloqué el QR en las mesas. Mis clientes lo aman y yo dejé de reimprimir cartas.",
        name: "María Fernández",
        role: "Dueña · La Parrilla de Juan",
      },
      {
        quote:
          "Cuando sube un precio lo cambio desde el celular y ya está actualizado para todos. Antes tocaba reimprimir todo el menú.",
        name: "Carlos Reinoso",
        role: "Dueño · Cachapas El Rincón",
      },
      {
        quote:
          "Los pedidos llegan directo a mi WhatsApp, ya armados con cantidades y total. Se nos hizo mucho más fácil atender.",
        name: "Andrea López",
        role: "Dueña · Sabor Casero",
      },
    ],
  },
  cta: {
    heading: "Moderniza el menú de tu restaurante hoy",
    subheading: "Únete a los restaurantes que ya dejaron atrás el menú de papel.",
    button: "Crea tu cuenta gratis",
  },
  footer: {
    developedBy: "Desarrollado por",
  },
  auth: {
    login: {
      title: "Inicia sesión",
      subtitle: "Administra el menú de tu restaurante.",
      emailLabel: "Correo",
      passwordLabel: "Contraseña",
      submit: "Entrar",
      submitting: "Entrando...",
      noAccount: "¿No tienes cuenta?",
      signupLink: "Regístrate",
      errorInvalid: "Correo o contraseña incorrectos.",
      forgotPasswordLink: "¿Olvidaste tu contraseña?",
    },
    signup: {
      title: "Crea tu cuenta",
      subtitle: "Publica el menú digital de tu restaurante gratis.",
      fullNameLabel: "Nombre completo",
      fullNamePlaceholder: "María Pérez",
      emailLabel: "Correo",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Mínimo 8 caracteres",
      submit: "Crear cuenta",
      submitting: "Creando cuenta...",
      haveAccount: "¿Ya tienes cuenta?",
      loginLink: "Inicia sesión",
      errorExists: "Ese correo ya tiene una cuenta.",
      errorGeneric: "No pudimos crear tu cuenta. Intenta de nuevo.",
      checkEmail:
        "Te enviamos un correo de confirmación. Abre el enlace para activar tu cuenta y comenzar.",
    },
    forgotPassword: {
      title: "Recupera tu contraseña",
      subtitle: "Ingresa tu correo y te enviaremos un enlace para restablecerla.",
      emailLabel: "Correo",
      submit: "Enviar enlace",
      submitting: "Enviando...",
      success: "Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña.",
      errorGeneric: "No pudimos enviar el correo. Intenta de nuevo.",
      backToLogin: "Volver a iniciar sesión",
    },
    resetPassword: {
      title: "Nueva contraseña",
      subtitle: "Ingresa tu nueva contraseña para tu cuenta.",
      passwordLabel: "Nueva contraseña",
      passwordPlaceholder: "Mínimo 8 caracteres",
      confirmLabel: "Confirmar contraseña",
      submit: "Guardar contraseña",
      submitting: "Guardando...",
      errorMismatch: "Las contraseñas no coinciden.",
      errorGeneric: "No pudimos actualizar tu contraseña. Intenta de nuevo.",
      errorSession: "Este enlace ya expiró o no es válido. Solicita uno nuevo.",
      success: "Tu contraseña se actualizó. Ya puedes iniciar sesión.",
    },
    continueWithGoogle: "Continuar con Google",
    orDivider: "o",
  },
  adminNav: {
    summary: "Resumen",
    myRestaurant: "Mi restaurante",
    categories: "Categorías",
    menu: "Menú",
    orders: "Pedidos",
    paymentMethods: "Métodos de pago",
    subscription: "Suscripción",
    superadminPanel: "Panel superadmin",
    theme: "Tema",
    logout: "Cerrar sesión",
  },
  dashboard: {
    createTitle: "Crea el menú de tu restaurante",
    createSubtitle: "Solo toma un minuto. Podrás editar todo después.",
    createSubmitLabel: "Crear restaurante",
    greeting: (name: string) => `Hola, ${name} 👋`,
    published: "Tu menú está publicado y visible al público.",
    unpublished: "Tu menú aún no está publicado. Actívalo en Mi restaurante.",
    categoriesLabel: "Categorías",
    dishesLabel: "Platos",
    manageCategories: "Gestionar categorías",
    manageMenu: "Gestionar menú",
    viewPlans: "Ver planes",
    qrTitle: "Tu menú digital",
    qrHint: "Imprime este código QR y colócalo en tus mesas.",
  },
  restaurantPage: {
    title: "Mi restaurante",
    subtitle: "Esta información aparece en tu menú público.",
    logoLabel: "Logo",
    coverLabel: "Portada",
  },
  logoUploader: {
    placeholder: "Logo",
    change: "Cambiar logo",
    uploading: "Subiendo...",
  },
  coverUploader: {
    alt: "Portada",
    noCover: "Sin portada",
    change: "Cambiar portada",
    uploading: "Subiendo...",
  },
  openingHours: {
    title: "Horario de atención",
    hint: "Se muestra en tu menú público. Desmarca un día para indicar que ese día está cerrado.",
    closedLabel: "Cerrado",
    days: {
      mon: "Lunes",
      tue: "Martes",
      wed: "Miércoles",
      thu: "Jueves",
      fri: "Viernes",
      sat: "Sábado",
      sun: "Domingo",
    },
  },
  restaurantForm: {
    nameLabel: "Nombre del restaurante",
    namePlaceholder: "La Parrilla de Juan",
    urlLabel: "URL pública",
    urlPlaceholder: "la-parrilla-de-juan",
    descriptionLabel: "Descripción",
    descriptionPlaceholder: "Cocina venezolana casera, especialidad en parrillas.",
    phoneLabel: "Teléfono",
    whatsappLabel: "WhatsApp",
    addressLabel: "Dirección",
    addressPlaceholder: "Av. Bolívar, Maracay",
    mapsUrlLabel: "Enlace de Google Maps",
    mapsUrlPlaceholder: "https://maps.app.goo.gl/...",
    mapsUrlHint:
      "Pega el enlace para compartir de Google Maps. Se mostrará como \"Ubicación\" en tu menú público y llevará a tus clientes directo al mapa.",
    socialLabel: "Redes sociales",
    socialHint: "Se muestran como íconos junto a tu logo en el menú público.",
    instagramLabel: "Instagram",
    tiktokLabel: "TikTok",
    facebookLabel: "Facebook",
    servicesLabel: "Servicios que ofreces",
    servicesHint: "Se muestran como íconos en tu menú público.",
    serviceDelivery: "Delivery",
    servicePickup: "Para llevar",
    serviceDineIn: "Comer en el local",
    wifiLabel: "Cuenta con wifi",
    petsLabel: "Acepta mascotas",
    colorLabel: "Color de marca",
    currencyLabel: "Moneda",
    publishLabel: "Publicar menú (visible en tu URL pública)",
    deliveryZonesLabel: "Zonas de envío",
    deliveryZonesPlaceholder: "Centro, 2.00\nUrbanización El Bosque, 3.50\nZona rural, 5.00",
    deliveryZonesHint:
      "Una zona por línea: nombre, costo de envío. Usa 0 si el envío es gratis. Tus clientes la elegirán al pedir delivery y se sumará al total.",
    saving: "Guardando...",
    saved: "Ajustes guardados",
  },
  categoriesPage: {
    title: "Categorías",
    subtitle: "Organiza tu menú en secciones: entradas, platos fuertes, postres...",
  },
  categoryManager: {
    empty: "Aún no tienes categorías.",
    newPlaceholder: "Nueva categoría (ej. Postres)",
    deleteConfirm: (name: string) => `¿Eliminar "${name}" y sus platos?`,
    moveUp: "Mover arriba",
    moveDown: "Mover abajo",
  },
  menuPage: {
    title: "Menú",
    subtitle: "Agrega, edita y organiza los platos de tu restaurante.",
    noCategories: "Crea al menos una categoría antes de agregar platos.",
    goToCategories: "Ir a categorías",
  },
  menuManager: {
    addDish: "+ Agregar plato",
    noItems: "Sin platos todavía.",
    available: "Disponible",
    soldOut: "Agotado",
    deleteConfirm: (name: string) => `¿Eliminar "${name}"?`,
    saveChanges: "Guardar cambios",
  },
  menuItemForm: {
    nameLabel: "Nombre del plato",
    namePlaceholder: "Pabellón criollo",
    categoryLabel: "Categoría",
    priceLabel: "Precio",
    descriptionLabel: "Descripción",
    descriptionPlaceholder: "Arroz, caraotas, carne mechada y tajadas.",
    tagsLabel: "Etiquetas (separadas por coma)",
    tagsPlaceholder: "vegano, picante, sin gluten",
    extrasLabel: "Toppings y extras",
    extrasPlaceholder: "Queso extra, 1.00\nTocineta, 1.50\nSalsa picante, 0",
    extrasHint: "Un extra por línea: nombre, precio. Usa 0 si el extra es gratis.",
    imageLabel: "Foto del plato",
    availableLabel: "Disponible",
    featuredLabel: "Destacado",
    addSubmit: "Agregar plato",
    saving: "Guardando...",
  },
  ordersPage: {
    title: "Pedidos",
    subtitle: "Pedidos hechos desde tu menú público. Acepta o rechaza cada uno.",
  },
  ordersManager: {
    filters: { pending: "Pendientes", accepted: "Aceptados", rejected: "Rechazados", all: "Todos" },
    empty: "No hay pedidos en esta categoría.",
    customer: "Cliente",
    payment: "Pago",
    noPaymentMethod: "Sin método de pago especificado.",
    dishes: "Platos",
    total: "Total",
    accept: "Aceptar",
    reject: "Rechazar",
    table: "Mesa",
    deliveryZone: "Zona de envío",
    deliveryFee: "Costo de envío",
    bankFrom: "Banco",
    reference: "Referencia",
    amountPaid: "Monto pagado",
    receiptAlt: "Comprobante de pago",
    orderTypes: { delivery: "Delivery", pickup: "Para retirar", dine_in: "Comer en el local" },
    statuses: { pending: "Pendiente", accepted: "Aceptado", rejected: "Rechazado" },
  },
  adminPaymentMethodsPage: {
    title: "Métodos de pago",
    subtitle:
      "Activa los métodos que aceptas y completa tus datos. Tus clientes los verán al armar su pedido en tu menú público.",
  },
  paymentMethodsForm: {
    convertNotice: "Se cobra en Bs a tasa BCV",
    selectBank: "Selecciona tu banco",
    save: "Guardar métodos de pago",
    saving: "Guardando...",
  },
  subscriptionPage: {
    title: "Suscripción",
    subtitle:
      "Elige el plan que se ajuste a tu restaurante y actívalo con tu método de pago preferido.",
  },
  subscriptionView: {
    currentPlan: "Tu plan actual",
    daysLeft: (n: number) => `Vence en ${n} ${n === 1 ? "día" : "días"}`,
    dueToday: "Tu plan vence hoy",
    daysOverdue: (n: number) => `Tu plan venció hace ${n} ${n === 1 ? "día" : "días"}`,
    currentPlanBadge: "Plan actual",
    freePlanBadge: "Plan gratuito",
    hidePayment: "Ocultar formas de pago",
  },
  subscriptionPaymentMethods: {
    payPlan: (name: string, price: string) => `Paga tu plan ${name} (${price})`,
    instructions:
      "Elige tu método de pago preferido, realiza el pago y notifícanos por WhatsApp para activar tu suscripción.",
    bcvAmountLabel: "Monto a pagar (tasa BCV)",
    bcvRateLabel: (rate: string) => `Tasa BCV: Bs ${rate} por USD`,
    bcvUpdatedAt: (date: string) => `actualizada ${date}`,
    bcvUnavailable:
      "No pudimos obtener la tasa BCV del día. Paga el equivalente en bolívares a la tasa oficial vigente y notifícanos el monto.",
    amountBsFieldLabel: "Monto (Bs)",
    notify: "Ya realicé el pago, notificar por WhatsApp",
    notifying: "Enviando...",
    noMethodsTitle: (name: string) =>
      `Levery todavía no configuró sus métodos de pago. Escríbenos por WhatsApp para coordinar el pago de tu plan ${name}.`,
    whatsappSupport: "Escribir por WhatsApp",
    messageIntro: (restaurantName: string, planName: string, planPrice: string, amountBs: string) =>
      `Hola! Soy ${restaurantName} y ya realicé el pago del plan ${planName} (${planPrice}${amountBs}).`,
    messageMethod: (label: string) => `Método de pago: ${label}.`,
    messageBankFrom: (bank: string) => `Banco desde el que pagué: ${bank}.`,
    messageReference: (ref: string) => `Referencia: ${ref}.`,
    messageAmountPaid: (amount: string) => `Monto pagado: Bs ${amount}.`,
    messageReceipt: (url: string) => `Comprobante: ${url}`,
    messageReceiptPending: "Adjunto el comprobante.",
  },
  superadminNav: {
    restaurants: "Restaurantes",
    payments: "Pagos",
    plans: "Planes",
    paymentMethods: "Métodos de pago",
    badge: "Superadmin",
    backToRestaurant: "← Volver a mi restaurante",
    theme: "Tema",
    logout: "Cerrar sesión",
  },
  superadminRestaurantsPage: {
    title: "Restaurantes",
    subtitle:
      "Administra el plan y el vencimiento de cada restaurante, y envía alertas de vencimiento por WhatsApp.",
  },
  superadminRestaurants: {
    empty: "No hay restaurantes todavía.",
    editPlan: "Editar plan",
    sendAlert: "Enviar alerta de vencimiento",
    planLabel: "Plan",
    expiresLabel: "Vence el",
    useDuration: "Usar duración del plan",
    daysRemaining: (n: number) => `${n} día${n === 1 ? "" : "s"} restantes`,
    expiredDaysAgo: (n: number) => `venció hace ${n} día${n === 1 ? "" : "s"}`,
    daysRemainingShort: (n: number) => `vence en ${n} día${n === 1 ? "" : "s"}`,
    expiredGeneric: "ya venció",
    alertMessage: (name: string, status: string) =>
      `Hola ${name}! Te escribimos de Levery: tu plan ${status}. Escríbenos para renovarlo y seguir recibiendo pedidos por WhatsApp sin interrupciones.`,
  },
  superadminPaymentsPage: {
    title: "Pagos de suscripción",
    subtitle:
      "Pagos que los restaurantes han hecho para activar o renovar su plan. Revisa el comprobante y aprueba o rechaza — al aprobar se extiende automáticamente el vencimiento del plan.",
  },
  superadminPayments: {
    filters: { pending: "Pendientes", approved: "Aprobados", rejected: "Rechazados", all: "Todos" },
    empty: "No hay pagos en esta categoría.",
    deletedRestaurant: "Restaurante eliminado",
    approve: "Aprobar",
    reject: "Rechazar",
    bankFrom: "Banco",
    reference: "Referencia",
    amountPaid: "Monto pagado",
    receiptAlt: "Comprobante de pago",
    statuses: { pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado" },
  },
  superadminPlansPage: {
    title: "Planes de suscripción",
    subtitle:
      "Crea y edita los planes que se muestran en la landing y en /admin/subscription. Desactiva un plan para dejar de mostrarlo sin borrarlo.",
  },
  superadminPlans: {
    newPlan: "+ Nuevo plan",
    deleteConfirm: (name: string) => `¿Eliminar el plan "${name}"?`,
    inactiveBadge: "Inactivo",
    highlightBadge: "Destacado",
    daysUnit: "días",
  },
  superadminPlanForm: {
    nameLabel: "Nombre",
    keyLabel: "Key (identificador único)",
    priceLabel: "Precio (USD)",
    oldPriceLabel: "Precio anterior (USD, opcional)",
    periodLabel: "Periodo (texto)",
    durationLabel: "Duración (días)",
    ctaLabel: "Texto del botón",
    sortOrderLabel: "Orden",
    featuresLabel: "Características (una por línea)",
    featuresPlaceholder: "Menú ilimitado\nCódigo QR\nPedidos por WhatsApp",
    highlightLabel: '"Destacado" ("Más popular")',
    activeLabel: "Activo (visible públicamente)",
    createSubmit: "Crear plan",
    saveSubmit: "Guardar cambios",
    saving: "Guardando...",
  },
  superadminPaymentMethodsPage: {
    title: "Métodos de pago de Levery",
    subtitle:
      "Estos son los datos que ven los restaurantes al pagar su suscripción desde /admin/subscription.",
  },
};

const en: typeof es = {
  common: {
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
  },
  nav: {
    howItWorks: "How it works",
    pricing: "Pricing",
    login: "Log in",
    startFree: "Start free",
  },
  hero: {
    badge: "Digital menu for restaurants",
    title: "Your restaurant's menu, always up to date.",
    description:
      "Create a landing page and a digital menu with a QR code in minutes. Edit dishes and prices from your dashboard, no reprinting needed.",
    ctaPrimary: "Create your free menu",
    ctaSecondary: "How it works",
  },
  howItWorks: {
    heading: "How it works",
    subheading: "Create your restaurant's menu the easy way, no hassle",
    steps: [
      {
        title: "Create your restaurant",
        description: "Create your restaurant's profile and share it via link or QR code.",
      },
      {
        title: "Customize your brand",
        description:
          "Choose your restaurant's color and logo so the menu feels like yours.",
      },
      {
        title: "Build your menu",
        description: "Add each dish with photos, prices, descriptions, and tags.",
      },
      {
        title: "Set up your WhatsApp",
        description: "Connect your number to receive orders straight in your chat.",
      },
      {
        title: "Share your QR",
        description: "Your customers scan the code at the table and see the menu instantly.",
      },
      {
        title: "Update in real time",
        description:
          "Mark a dish as sold out or change a price and it updates instantly.",
      },
    ],
  },
  pricingSection: {
    heading: "Pick your plan and continue",
    subheading:
      "Start with 15 days free or activate the monthly or annual plan right away, no hidden fees.",
    mostPopular: "Most popular",
  },
  faq: {
    heading: "Frequently asked questions",
    subheading: "Explore the most common questions and see how Levery works.",
    items: [
      {
        question: "I have a small business, can I still sign up?",
        answer:
          "Of course. Levery was built for large, medium, and small restaurants, and also for businesses that are just getting started.",
      },
      {
        question: "Can I mark a dish as unavailable?",
        answer:
          "Yes. From your dashboard you can mark any dish as sold out with one click, or delete it entirely if you're no longer offering it.",
      },
      {
        question: "Can I try it before paying?",
        answer:
          "Sure! You get 15 days free to get to know the app and try all its features. If you like it (you will), activate your subscription whenever you want.",
      },
      {
        question: "Can I update my menu whenever I want?",
        answer:
          "Yes. Log in to your account, make the changes, and they update instantly. You decide when to change prices, photos, or dishes, without depending on anyone.",
      },
      {
        question: "Do I need to know design or programming?",
        answer:
          "Not at all. Levery is as easy to use as filling out a form. Upload your dishes, set prices, pick your brand color... and that's it! Your digital menu, instantly.",
      },
      {
        question: "Do I need a computer, or can I do it from my phone?",
        answer:
          "You can use Levery from wherever is most convenient: phone, tablet, or computer. Your choice!",
      },
      {
        question: "Can I add photos of my dishes?",
        answer:
          "Sure! Photos make your menu look more appetizing and professional. You can upload them directly from your gallery.",
      },
      {
        question: "Can I organize my menu into categories?",
        answer:
          "Yes. You can create as many categories as you need (Starters, Desserts, Drinks, or anything you want) and order them however you like. Everything neatly organized for your customers.",
      },
      {
        question: "Does my menu have a unique link?",
        answer:
          "Yes. You'll get a personalized link with your restaurant's name to share on WhatsApp, Instagram, or anywhere else. You can also print your QR code.",
      },
      {
        question: "Can I highlight promotions or dishes of the day?",
        answer:
          "Yes. You can mark any dish as featured so it stands out in your menu — ideal for promotions or daily specials.",
      },
    ],
  },
  testimonials: {
    label: "Testimonials",
    heading: "Restaurants that already went digital",
    items: [
      {
        quote:
          "I put together the whole menu in one afternoon and placed the QR on the tables. My customers love it and I stopped reprinting menus.",
        name: "María Fernández",
        role: "Owner · La Parrilla de Juan",
      },
      {
        quote:
          "When a price goes up I change it from my phone and it's instantly updated for everyone. Before, we had to reprint the whole menu.",
        name: "Carlos Reinoso",
        role: "Owner · Cachapas El Rincón",
      },
      {
        quote:
          "Orders come straight to my WhatsApp, already put together with quantities and total. It made serving customers so much easier.",
        name: "Andrea López",
        role: "Owner · Sabor Casero",
      },
    ],
  },
  cta: {
    heading: "Modernize your restaurant's menu today",
    subheading: "Join the restaurants that already left paper menus behind.",
    button: "Create your free account",
  },
  footer: {
    developedBy: "Developed by",
  },
  auth: {
    login: {
      title: "Log in",
      subtitle: "Manage your restaurant's menu.",
      emailLabel: "Email",
      passwordLabel: "Password",
      submit: "Log in",
      submitting: "Logging in...",
      noAccount: "Don't have an account?",
      signupLink: "Sign up",
      errorInvalid: "Incorrect email or password.",
      forgotPasswordLink: "Forgot your password?",
    },
    signup: {
      title: "Create your account",
      subtitle: "Publish your restaurant's digital menu for free.",
      fullNameLabel: "Full name",
      fullNamePlaceholder: "María Pérez",
      emailLabel: "Email",
      passwordLabel: "Password",
      passwordPlaceholder: "8 characters minimum",
      submit: "Create account",
      submitting: "Creating account...",
      haveAccount: "Already have an account?",
      loginLink: "Log in",
      errorExists: "That email already has an account.",
      errorGeneric: "We couldn't create your account. Please try again.",
      checkEmail:
        "We sent you a confirmation email. Open the link to activate your account and get started.",
    },
    forgotPassword: {
      title: "Reset your password",
      subtitle: "Enter your email and we'll send you a link to reset it.",
      emailLabel: "Email",
      submit: "Send link",
      submitting: "Sending...",
      success: "Check your email. We sent you a link to reset your password.",
      errorGeneric: "We couldn't send the email. Please try again.",
      backToLogin: "Back to log in",
    },
    resetPassword: {
      title: "New password",
      subtitle: "Enter a new password for your account.",
      passwordLabel: "New password",
      passwordPlaceholder: "8 characters minimum",
      confirmLabel: "Confirm password",
      submit: "Save password",
      submitting: "Saving...",
      errorMismatch: "Passwords don't match.",
      errorGeneric: "We couldn't update your password. Please try again.",
      errorSession: "This link has expired or is invalid. Request a new one.",
      success: "Your password was updated. You can now log in.",
    },
    continueWithGoogle: "Continue with Google",
    orDivider: "or",
  },
  adminNav: {
    summary: "Overview",
    myRestaurant: "My restaurant",
    categories: "Categories",
    menu: "Menu",
    orders: "Orders",
    paymentMethods: "Payment methods",
    subscription: "Subscription",
    superadminPanel: "Superadmin panel",
    theme: "Theme",
    logout: "Log out",
  },
  dashboard: {
    createTitle: "Create your restaurant's menu",
    createSubtitle: "It only takes a minute. You can edit everything later.",
    createSubmitLabel: "Create restaurant",
    greeting: (name: string) => `Hi, ${name} 👋`,
    published: "Your menu is published and visible to the public.",
    unpublished: "Your menu isn't published yet. Turn it on in My restaurant.",
    categoriesLabel: "Categories",
    dishesLabel: "Dishes",
    manageCategories: "Manage categories",
    manageMenu: "Manage menu",
    viewPlans: "View plans",
    qrTitle: "Your digital menu",
    qrHint: "Print this QR code and place it on your tables.",
  },
  restaurantPage: {
    title: "My restaurant",
    subtitle: "This information appears on your public menu.",
    logoLabel: "Logo",
    coverLabel: "Cover",
  },
  logoUploader: {
    placeholder: "Logo",
    change: "Change logo",
    uploading: "Uploading...",
  },
  coverUploader: {
    alt: "Cover",
    noCover: "No cover",
    change: "Change cover",
    uploading: "Uploading...",
  },
  openingHours: {
    title: "Opening hours",
    hint: "Shown on your public menu. Uncheck a day to mark it as closed.",
    closedLabel: "Closed",
    days: {
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday",
      sun: "Sunday",
    },
  },
  restaurantForm: {
    nameLabel: "Restaurant name",
    namePlaceholder: "La Parrilla de Juan",
    urlLabel: "Public URL",
    urlPlaceholder: "la-parrilla-de-juan",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Homestyle Venezuelan cuisine, grill specialties.",
    phoneLabel: "Phone",
    whatsappLabel: "WhatsApp",
    addressLabel: "Address",
    addressPlaceholder: "Av. Bolívar, Maracay",
    mapsUrlLabel: "Google Maps link",
    mapsUrlPlaceholder: "https://maps.app.goo.gl/...",
    mapsUrlHint:
      "Paste the Google Maps share link. It will show as \"Location\" on your public menu and take customers straight to the map.",
    socialLabel: "Social media",
    socialHint: "Shown as icons next to your logo on the public menu.",
    instagramLabel: "Instagram",
    tiktokLabel: "TikTok",
    facebookLabel: "Facebook",
    servicesLabel: "Services you offer",
    servicesHint: "Shown as icons on your public menu.",
    serviceDelivery: "Delivery",
    servicePickup: "Pickup",
    serviceDineIn: "Dine-in",
    wifiLabel: "Has wifi",
    petsLabel: "Pet friendly",
    colorLabel: "Brand color",
    currencyLabel: "Currency",
    publishLabel: "Publish menu (visible at your public URL)",
    deliveryZonesLabel: "Delivery zones",
    deliveryZonesPlaceholder: "Downtown, 2.00\nEl Bosque neighborhood, 3.50\nRural area, 5.00",
    deliveryZonesHint:
      "One zone per line: name, delivery fee. Use 0 if delivery is free. Customers pick one when ordering delivery and it's added to the total.",
    saving: "Saving...",
    saved: "Settings saved",
  },
  categoriesPage: {
    title: "Categories",
    subtitle: "Organize your menu into sections: starters, mains, desserts...",
  },
  categoryManager: {
    empty: "You don't have any categories yet.",
    newPlaceholder: "New category (e.g. Desserts)",
    deleteConfirm: (name: string) => `Delete "${name}" and its dishes?`,
    moveUp: "Move up",
    moveDown: "Move down",
  },
  menuPage: {
    title: "Menu",
    subtitle: "Add, edit, and organize your restaurant's dishes.",
    noCategories: "Create at least one category before adding dishes.",
    goToCategories: "Go to categories",
  },
  menuManager: {
    addDish: "+ Add dish",
    noItems: "No dishes yet.",
    available: "Available",
    soldOut: "Sold out",
    deleteConfirm: (name: string) => `Delete "${name}"?`,
    saveChanges: "Save changes",
  },
  menuItemForm: {
    nameLabel: "Dish name",
    namePlaceholder: "Pabellón criollo",
    categoryLabel: "Category",
    priceLabel: "Price",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Rice, beans, shredded beef, and fried plantain.",
    tagsLabel: "Tags (comma-separated)",
    tagsPlaceholder: "vegan, spicy, gluten-free",
    extrasLabel: "Toppings and extras",
    extrasPlaceholder: "Extra cheese, 1.00\nBacon, 1.50\nHot sauce, 0",
    extrasHint: "One extra per line: name, price. Use 0 if the extra is free.",
    imageLabel: "Dish photo",
    availableLabel: "Available",
    featuredLabel: "Featured",
    addSubmit: "Add dish",
    saving: "Saving...",
  },
  ordersPage: {
    title: "Orders",
    subtitle: "Orders placed from your public menu. Accept or reject each one.",
  },
  ordersManager: {
    filters: { pending: "Pending", accepted: "Accepted", rejected: "Rejected", all: "All" },
    empty: "No orders in this category.",
    customer: "Customer",
    payment: "Payment",
    noPaymentMethod: "No payment method specified.",
    dishes: "Dishes",
    total: "Total",
    accept: "Accept",
    reject: "Reject",
    table: "Table",
    deliveryZone: "Delivery zone",
    deliveryFee: "Delivery fee",
    bankFrom: "Bank",
    reference: "Reference",
    amountPaid: "Amount paid",
    receiptAlt: "Payment receipt",
    orderTypes: { delivery: "Delivery", pickup: "Pickup", dine_in: "Dine in" },
    statuses: { pending: "Pending", accepted: "Accepted", rejected: "Rejected" },
  },
  adminPaymentMethodsPage: {
    title: "Payment methods",
    subtitle:
      "Turn on the methods you accept and fill in your details. Your customers will see them when placing an order on your public menu.",
  },
  paymentMethodsForm: {
    convertNotice: "Charged in Bs at the BCV rate",
    selectBank: "Select your bank",
    save: "Save payment methods",
    saving: "Saving...",
  },
  subscriptionPage: {
    title: "Subscription",
    subtitle: "Choose the plan that fits your restaurant and activate it with your preferred payment method.",
  },
  subscriptionView: {
    currentPlan: "Your current plan",
    daysLeft: (n: number) => `Expires in ${n} day${n === 1 ? "" : "s"}`,
    dueToday: "Your plan expires today",
    daysOverdue: (n: number) => `Your plan expired ${n} day${n === 1 ? "" : "s"} ago`,
    currentPlanBadge: "Current plan",
    freePlanBadge: "Free plan",
    hidePayment: "Hide payment methods",
  },
  subscriptionPaymentMethods: {
    payPlan: (name: string, price: string) => `Pay for your ${name} plan (${price})`,
    instructions:
      "Choose your preferred payment method, make the payment, and notify us on WhatsApp to activate your subscription.",
    bcvAmountLabel: "Amount to pay (BCV rate)",
    bcvRateLabel: (rate: string) => `BCV rate: Bs ${rate} per USD`,
    bcvUpdatedAt: (date: string) => `updated ${date}`,
    bcvUnavailable:
      "We couldn't get today's BCV rate. Pay the equivalent in bolívares at the current official rate and let us know the amount.",
    amountBsFieldLabel: "Amount (Bs)",
    notify: "I already paid, notify via WhatsApp",
    notifying: "Sending...",
    noMethodsTitle: (name: string) =>
      `Levery hasn't set up its payment methods yet. Write to us on WhatsApp to arrange payment for your ${name} plan.`,
    whatsappSupport: "Write on WhatsApp",
    messageIntro: (restaurantName: string, planName: string, planPrice: string, amountBs: string) =>
      `Hi! I'm ${restaurantName} and I already paid for the ${planName} plan (${planPrice}${amountBs}).`,
    messageMethod: (label: string) => `Payment method: ${label}.`,
    messageBankFrom: (bank: string) => `Bank I paid from: ${bank}.`,
    messageReference: (ref: string) => `Reference: ${ref}.`,
    messageAmountPaid: (amount: string) => `Amount paid: Bs ${amount}.`,
    messageReceipt: (url: string) => `Receipt: ${url}`,
    messageReceiptPending: "Receipt attached.",
  },
  superadminNav: {
    restaurants: "Restaurants",
    payments: "Payments",
    plans: "Plans",
    paymentMethods: "Payment methods",
    badge: "Superadmin",
    backToRestaurant: "← Back to my restaurant",
    theme: "Theme",
    logout: "Log out",
  },
  superadminRestaurantsPage: {
    title: "Restaurants",
    subtitle:
      "Manage each restaurant's plan and expiration, and send expiration alerts via WhatsApp.",
  },
  superadminRestaurants: {
    empty: "No restaurants yet.",
    editPlan: "Edit plan",
    sendAlert: "Send expiration alert",
    planLabel: "Plan",
    expiresLabel: "Expires on",
    useDuration: "Use plan duration",
    daysRemaining: (n: number) => `${n} day${n === 1 ? "" : "s"} remaining`,
    expiredDaysAgo: (n: number) => `expired ${n} day${n === 1 ? "" : "s"} ago`,
    daysRemainingShort: (n: number) => `expires in ${n} day${n === 1 ? "" : "s"}`,
    expiredGeneric: "already expired",
    alertMessage: (name: string, status: string) =>
      `Hi ${name}! This is Levery: your plan ${status}. Write to us to renew it and keep receiving orders via WhatsApp without interruptions.`,
  },
  superadminPaymentsPage: {
    title: "Subscription payments",
    subtitle:
      "Payments restaurants have made to activate or renew their plan. Review the receipt and approve or reject — approving automatically extends the plan's expiration.",
  },
  superadminPayments: {
    filters: { pending: "Pending", approved: "Approved", rejected: "Rejected", all: "All" },
    empty: "No payments in this category.",
    deletedRestaurant: "Deleted restaurant",
    approve: "Approve",
    reject: "Reject",
    bankFrom: "Bank",
    reference: "Reference",
    amountPaid: "Amount paid",
    receiptAlt: "Payment receipt",
    statuses: { pending: "Pending", approved: "Approved", rejected: "Rejected" },
  },
  superadminPlansPage: {
    title: "Subscription plans",
    subtitle:
      "Create and edit the plans shown on the landing page and in /admin/subscription. Deactivate a plan to stop showing it without deleting it.",
  },
  superadminPlans: {
    newPlan: "+ New plan",
    deleteConfirm: (name: string) => `Delete the "${name}" plan?`,
    inactiveBadge: "Inactive",
    highlightBadge: "Highlighted",
    daysUnit: "days",
  },
  superadminPlanForm: {
    nameLabel: "Name",
    keyLabel: "Key (unique identifier)",
    priceLabel: "Price (USD)",
    oldPriceLabel: "Old price (USD, optional)",
    periodLabel: "Period (text)",
    durationLabel: "Duration (days)",
    ctaLabel: "Button text",
    sortOrderLabel: "Order",
    featuresLabel: "Features (one per line)",
    featuresPlaceholder: "Unlimited menu\nQR code\nOrders via WhatsApp",
    highlightLabel: '"Highlighted" ("Most popular")',
    activeLabel: "Active (publicly visible)",
    createSubmit: "Create plan",
    saveSubmit: "Save changes",
    saving: "Saving...",
  },
  superadminPaymentMethodsPage: {
    title: "Levery's payment methods",
    subtitle: "This is what restaurants see when paying their subscription from /admin/subscription.",
  },
};

export const dictionaries = { es, en } as const;
export type Dictionary = typeof es;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
