\connect n8n

-- n8n creates this table on first run, but we pre-create it so seed data is available immediately
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
    id        BIGSERIAL    PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message    JSONB        NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
DECLARE
  phones CONSTANT TEXT[] := ARRAY[
    '5215512340001','5215512340002','5215512340003','5215512340004','5215512340005',
    '5215512340006','5215512340007','5215512340008','5215512340009','5215512340010',
    '5215512340011','5215512340012','5215512340013','5215512340014','5215512340015'
  ];
  human_msgs CONSTANT TEXT[] := ARRAY[
    'Hola, necesito información sobre sus servicios',
    'Buenas tardes, ¿cuáles son sus horarios de atención?',
    'Hola, tengo un problema con mi pedido',
    'Buenos días, ¿tienen disponibilidad para esta semana?',
    'Hola, quisiera saber el estado de mi entrega',
    'Buenas noches, necesito ayuda urgente con mi cuenta',
    'Hola, ¿pueden atenderme por este medio?',
    'Buenos días, quiero hacer una consulta sobre precios',
    'Hola, me llegó un cargo incorrecto en mi factura',
    'Buenas tardes, ¿cómo puedo cancelar mi suscripción?'
  ];
  ai_msgs CONSTANT TEXT[] := ARRAY[
    'Hola! Con gusto te atendemos. ¿En qué te puedo ayudar?',
    'Buenos días! Nuestro horario es de lunes a viernes de 9am a 6pm.',
    'Hola! Lamentamos el inconveniente. ¿Me puedes compartir tu número de pedido?',
    'Buenos días! Sí tenemos disponibilidad. ¿Qué fecha te conviene mejor?',
    'Hola! Dame un momento para revisar el estado de tu envío.',
    'Buenas noches! Aquí estamos para ayudarte. ¿Cuál es la situación?',
    'Hola! Claro, con gusto te atendemos. ¿Cuál es tu consulta?',
    'Buenos días! Por supuesto, te comparto nuestra lista de precios actualizada.',
    'Hola! Revisaré tu factura de inmediato y te informo.',
    'Buenas tardes! Puedo ayudarte con eso. ¿Me confirmas tu número de cliente?'
  ];

  day_offset INT;
  d          DATE;
  dow        INT;
  num_conv   INT;
  conv_num   INT;
  phone_idx  INT;
  msg_idx    INT;
  sent_at    TIMESTAMPTZ;
BEGIN
  -- Abril 1 – Mayo 2, 2026  (day_offset 0..31)
  FOR day_offset IN 0..31 LOOP
    d := DATE '2026-04-01' + day_offset;
    EXIT WHEN d > DATE '2026-05-02';

    dow := EXTRACT(DOW FROM d)::int;  -- 0=domingo, 6=sábado

    IF dow IN (0, 6) THEN
      num_conv := 3 + (EXTRACT(DAY FROM d)::int % 4);   -- 3-6 fines de semana
    ELSE
      num_conv := 7 + (EXTRACT(DAY FROM d)::int % 6);   -- 7-12 días hábiles
    END IF;

    FOR conv_num IN 1..num_conv LOOP
      phone_idx := ((EXTRACT(DAY FROM d)::int * 7 + conv_num * 3) % 15) + 1;
      msg_idx   := ((EXTRACT(DAY FROM d)::int + conv_num) % 10) + 1;
      -- Horas entre 8 y 17
      sent_at   := d::timestamptz + ((8 + (conv_num % 10)) || ' hours')::interval;

      -- Mensaje del usuario
      INSERT INTO n8n_chat_histories (session_id, message, created_at) VALUES (
        phones[phone_idx],
        jsonb_build_object('type', 'human', 'content', human_msgs[msg_idx], 'additional_kwargs', '{}'::jsonb),
        sent_at
      );

      -- Respuesta de la IA
      INSERT INTO n8n_chat_histories (session_id, message, created_at) VALUES (
        phones[phone_idx],
        jsonb_build_object('type', 'ai', 'content', ai_msgs[msg_idx], 'additional_kwargs', '{}'::jsonb),
        sent_at + INTERVAL '45 seconds'
      );

      -- Seguimiento en el 80 % de las conversaciones
      IF conv_num % 5 != 0 THEN
        INSERT INTO n8n_chat_histories (session_id, message, created_at) VALUES (
          phones[phone_idx],
          jsonb_build_object('type', 'human', 'content', '¿Podrías ampliarme más la información?', 'additional_kwargs', '{}'::jsonb),
          sent_at + INTERVAL '2 minutes'
        );

        INSERT INTO n8n_chat_histories (session_id, message, created_at) VALUES (
          phones[phone_idx],
          jsonb_build_object('type', 'ai', 'content', 'Claro que sí, con gusto te explico con más detalle. ¿Tienes alguna pregunta adicional?', 'additional_kwargs', '{}'::jsonb),
          sent_at + INTERVAL '3 minutes'
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;
