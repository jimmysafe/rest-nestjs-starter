const { Producer } = require("sqs-producer");

module.exports.handler = async (event, context, callback) => {
  console.log(event, context);

  const producer = Producer.create({
    queueUrl: process.env.SQS_QUEUE_NAME,
    region: "eu-central-1",
  });

  const { sub, email, phone_number, given_name, family_name } =
    event.request.userAttributes;

  if (!email) {
    console.error("No email specified");
    return callback("You must give an email", event);
  }

  const message = {
    id: sub,
    body: "user.create",
    messageAttributes: {
      UserId: {
        DataType: "String",
        StringValue: sub,
      },
      Email: {
        DataType: "String",
        StringValue: email,
      },
      Nome: {
        DataType: "String",
        StringValue: given_name,
      },
      Cognome: {
        DataType: "String",
        StringValue: family_name,
      },
      Telefono: {
        DataType: "String",
        StringValue: phone_number,
      },
    },
  };

  if (event.request.userAttributes["custom:codice_fiscale"]) {
    message.messageAttributes.CodiceFiscale = {
      DataType: "String",
      StringValue: event.request.userAttributes["custom:codice_fiscale"],
    };
  }

  if (event.request.userAttributes["custom:partita_iva"]) {
    message.messageAttributes.PartitaIva = {
      DataType: "String",
      StringValue: event.request.userAttributes["custom:partita_iva"],
    };
  }

  const result = await producer.send(message);

  console.log("Send result", result);

  callback(null, event);
};
