const { Client, GatewayIntentBits } = require('discord.js');

// 1. CONFIGURACIÓN INICIAL DEL BOT
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers 
    ] 
});

// >>>>>> ¡ESTE ES EL ÚNICO VALOR RESTANTE QUE DEBES REEMPLAZAR! <<<<<<
const TOKEN = 'TU_TOKEN_DE_BOT_AQUÍ'; 

// ID DEL ROL DE MODERADOR (Confirmado por el usuario)
const ID_MODERADOR = '1435789744176103504'; 
const NOMBRE_ROL_APOYO = 'Amigo-¶';

// Regla 1: Lista de Groserías Estrictas (CENSURA TOTAL)
const palabrasProhibidas = [
    'imbécil', 'estúpido', 'tarado', 'baboso', 'pendejo', 'mamón', 'gilipollas', 
    'cabrón', 'hijo de puta', 'puta', 'mierda', 'coño', 'joder', 'carajo', 
    'marica', 'caca', 'mierdoso', 'chingar', 'chinga', 'verga', 'culero', 
    'boludo', 'concha', 'orto', 'maldito', 'perra', 'zorra', 'puto', 
    'coger', 'follar', 'huevon', 'imbecil', 'estupido', 'mamones' 
]; 
// Regla 3: Regex para detectar enlaces de invitación
const inviteRegex = /(discord\.gg\/|discordapp\.com\/invite\/)/i;


// --- EVENTO: EL BOT ESTÁ LISTO ---
client.on('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    console.log(`¡Bot 'Hablemos...' activado y vigilando las 5 reglas!`);
});


// --- EVENTO: PROCESAR MENSAJES (REGLAS 1, 5, 3, 4, y 2) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const contenido = message.content.toLowerCase();
    const esModerador = message.member && message.member.roles.cache.has(ID_MODERADOR);

    // ----------------------------------------------------
    // --- LÓGICA REGLA 1: CERO GROSERÍAS (ELIMINACIÓN ESTRICTA) ---
    // ----------------------------------------------------
    
    let esInapropiado = palabrasProhibidas.some(palabra => contenido.includes(palabra));

    if (esInapropiado) {
        try {
            await message.delete(); 
            message.channel.send(
                `¡ALTO, ${message.author}! 🛑 Regla 1: **CERO GROSERÍAS**. ` +
                `Tu mensaje fue eliminado. ¡Recuerda el tono **¶** y el respeto!`
            );
        } catch (error) {
            console.error('El bot no pudo borrar el mensaje (Regla 1). ¿Tiene permiso de Administrador?', error);
        }
        return; 
    }

    // ----------------------------------------------------
    // --- LÓGICA REGLA 3: NO A LO PRIVADO/DM (Censura de Invitaciones) ---
    // ----------------------------------------------------
    if (inviteRegex.test(message.content) && !esModerador) {
        try {
            await message.delete();
            message.channel.send(
                `¡ALTO, ${message.author}! 🛑 Regla 3: **No a lo privado/DM**. ` +
                `No se permiten enlaces de invitación de Discord externos.`
            );
        } catch (error) {
            console.error('Error al intentar eliminar mensaje (Regla 3):', error);
        }
        return;
    }


    // ----------------------------------------------------
    // --- LÓGICA REGLA 5: APOYO CON EL SIGNO ¶ (Asignación de Rol) ---
    // ----------------------------------------------------
    const simboloApoyo = '¶';

    if (contenido.includes(simboloApoyo)) {
        let rolApoyo = message.guild.roles.cache.find(rol => rol.name === NOMBRE_ROL_APOYO);

        if (!rolApoyo) {
            rolApoyo = await message.guild.roles.create({
                name: NOMBRE_ROL_APOYO,
                color: 'PURPLE',
                reason: 'Rol para miembros que apoyan las reglas de Hablemos... (¶)',
            });
        }

        if (!message.member.roles.cache.has(rolApoyo.id)) {
            await message.member.roles.add(rolApoyo);
            message.channel.send(
                `¡Gracias por tu apoyo, ${message.author}! Has recibido el rol **${NOMBRE_ROL_APOYO}**. ` +
                `¡Tu **¶** es clave para nuestro ambiente!`
            );
        } else {
            message.react('✅').catch(() => {});
        }
    }


    // ----------------------------------------------------
    // --- LÓGICA REGLA 4: TICKETS DE PRIVACIDAD (Comando: !privado) ---
    // ----------------------------------------------------
    if (contenido === '!privado') {
        const canalTicket = await message.guild.channels.create({
            name: `ticket-privado-${message.author.username}`,
            type: 0, 
            permissionOverwrites: [
                { id: message.guild.id, deny: ['ViewChannel'] },
                { id: message.author.id, allow: ['ViewChannel', 'SendMessages'] },
                { id: ID_MODERADOR, allow: ['ViewChannel', 'SendMessages'] },
            ],
        });
        
        await message.reply({
            content: `✅ Tu solicitud de permiso (Regla 4) ha sido abierta en ${canalTicket}. Ve allí.`,
            ephemeral: true 
        });

        canalTicket.send(
            `¡Hola, ${message.author}! Escribe aquí tu solicitud. <@&${ID_MODERADOR}> (Moderador), por favor, revisa esto. Usa \`!cerrar\` para terminar.`
        );
    }
    
    // ----------------------------------------------------
    // --- REGLA 2: CONTAR CANALES (Comando Admin/Mod: !canales) ---
    // ----------------------------------------------------
    if (contenido === '!canales') {
        if (esModerador) {
            const textChannels = message.guild.channels.cache.filter(c => c.type === 0 && !c.name.startsWith('ticket-privado-')); 
            
            message.reply(`Actualmente hay **${textChannels.size}** canales de texto activos. Regla 2: **"No más de 4"**.`);
        } else {
            message.reply('Este comando es solo para moderadores.');
        }
    }
});

// --- COMANDO PARA CERRAR EL TICKET (Regla 4) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.content.toLowerCase() !== '!cerrar') return;

    const esModerador = message.member && message.member.roles.cache.has(ID_MODERADOR);
    
    if (message.channel.name.startsWith('ticket-privado-') && 
        (message.channel.permissionOverwrites.cache.has(message.author.id) || esModerador)) {
            
        message.channel.send('Cerrando ticket en 5 segundos...').then(() => {
            setTimeout(() => message.channel.delete().catch(console.error), 5000);
        });
    }
});


// 4. CONECTAR EL BOT
client.login(TOKEN);