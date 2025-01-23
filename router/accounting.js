const Appointment = require("../models/appointment"); // Asegúrate de que la ruta sea correcta
const Accounting = require("../models/accounting"); // Asegúrate de que la ruta sea correcta
const Insurance = require("../models/insurances"); // Asegúrate de que la ruta sea correcta
const { calculateTotal } = require("../utils/calculateTotal");
const routes = require('express').Router();

async function generateAccounting(appointmentId) {
    try {
      // Buscar la cita por appointmentId
      const appointment = await Appointment.findById(appointmentId)
        .populate("services") // Poblamos los servicios
        .populate("patientId"); // Poblamos el paciente
  
      if (!appointment) {
        throw new Error("Cita no encontrada");
      }
  
      // Obtener los IDs de los servicios utilizados
      const servicesIds = appointment.services.map(service => service._id);
      const insuranceId = appointment.patientId.insuranceMake; // Asegúrate de que el paciente tenga un campo que referencia su seguro
  
      // Calcular el total utilizando la función calculateTotal
      const { total, insuranceTotal, userPayTotal, detailedServices } = await calculateTotal(servicesIds, insuranceId, appointment.patientIsInsurante);

      // Crear el registro contable
      const accountingEntry = new Accounting({
        appointmentId: appointment._id,
        date: appointment.dateAppointment,
        servicesUsed: detailedServices.map(service => ({
          service: service.serviceId,
          servicePrice: service.servicePrice,
          insurancePrice: service.insurancePrice,
          userPay: service.userPay,
        })),
        totalEarned: total,
        paymentWithoutInsurance: userPayTotal, // Si no tiene seguro, el total es el pago sin seguro
        insuranceCoverage: appointment.patientIsInsurante ? insuranceId : null,
        amountPaidByInsurance: insuranceTotal,
      });
  
      await accountingEntry.save();
      console.log("Registro contable creado:", accountingEntry);
      return accountingEntry; // Retornar el registro contable creado
    } catch (error) {
      console.error("Error al generar la contabilidad:", error);
      throw error; // Lanzar el error para manejarlo en la función de la ruta
    }
  }

const generateAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await generateAccounting(id);

        return res.status(200).json({
            ok: true,
            data: data
        });
    } catch(err) {
        return res.status(500).json({
            ok: false,
            msg: "INTERNAL_SERVER_ERROR"
        })
    }
}
routes.get('/:id', generateAccount);

const getAllAccountsReport = async (req, res) => {
  try {
    const accounts = await Accounting.find()
      .populate("appointmentId")
      .populate("insuranceCoverage")
      .populate("servicesUsed.service");

    return res.status(200).json({
      ok: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error al obtener el reporte de cuentas:", error);
    return res.status(500).json({
      ok: false,
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const getAccountsByInsuranceReport = async (req, res) => {
    try {
      const accounts = await Accounting.find({ insuranceCoverage: { $ne: null } })
        .populate("insuranceCoverage")
        .populate("servicesUsed.service");
  
      const report = accounts.reduce((acc, account) => {
        // Asegúrate de acceder a la propiedad correcta
        const insuranceName = account.insuranceCoverage ? account.insuranceCoverage.insuranceName : "Sin Aseguradora";
        if (!acc[insuranceName]) {
          acc[insuranceName] = [];
        }
        acc[insuranceName].push(account);
        return acc;
      }, {});
  
      return res.status(200).json({
        ok: true,
        data: report,
      });
    } catch (error) {
      console.error("Error al obtener el reporte por aseguradora:", error);
      return res.status(500).json({
        ok: false,
        msg: "INTERNAL_SERVER_ERROR",
      });
    }
  };

const getAccountsByServiceReport = async (req, res) => {
  try {
    const accounts = await Accounting.find()
      .populate("servicesUsed.service");

    const report = accounts.reduce((acc, account) => {
      account.servicesUsed.forEach(service => {
        const serviceName = service.service.serviceName;
        if (!acc[serviceName]) {
          acc[serviceName] = [];
        }
        acc[serviceName].push(account);
      });
      return acc;
    }, {});

    return res.status(200).json({
      ok: true,
      data: report,
    });
  } catch (error) {
    console.error("Error al obtener el reporte por servicio:", error);
    return res.status(500).json({
      ok: false,
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const getAccountsWithInsuranceReport = async (req, res) => {
  try {
    const accounts = await Accounting.find({ insuranceCoverage: { $ne: null } })
      .populate("insuranceCoverage")
      .populate("servicesUsed.service");

    return res.status(200).json({
      ok: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error al obtener el reporte de cuentas con seguro:", error);
    return res.status(500).json({
      ok: false,
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const getAccountsWithoutInsuranceReport = async (req, res) => {
  try {
    const accounts = await Accounting.find({ insuranceCoverage: null })
      .populate("servicesUsed.service");

    return res.status(200).json({
      ok: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error al obtener el reporte de cuentas sin seguro:", error);
    return res.status(500).json({
      ok: false,
      msg: "INTERNAL_SERVER_ERROR",
    });
  }
};

// Rutas

routes.get("/reports/all", getAllAccountsReport);
routes.get("/reports/by-insurance", getAccountsByInsuranceReport);
routes.get("/reports/by-service", getAccountsByServiceReport);
routes.get("/reports/with-insurance", getAccountsWithInsuranceReport);
routes.get("/reports/without-insurance", getAccountsWithoutInsuranceReport);

module.exports = routes;