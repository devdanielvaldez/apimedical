const Appointments = require("../models/appointment");
const router = require('express').Router();

const getMetrics = async (req, res) => {
  try {
    const appointments = await Appointments.find({}).populate('services');

    const serviceCounts = {};
    appointments.forEach(appointment => {
      appointment.services.forEach(service => {
        const serviceId = service._id.toString();
        if (serviceCounts[serviceId]) {
          serviceCounts[serviceId].count += 1;
        } else {
          serviceCounts[serviceId] = {
            count: 1,
            name: service.serviceName
          };
        }
      });
    });
    const mostUsedServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count);

    const appointmentsPerService = Object.values(serviceCounts);

    const servicesPerMonth = {};
    appointments.forEach(appointment => {
      const month = appointment.dateAppointment.getMonth() + 1;
      const year = appointment.dateAppointment.getFullYear();
      const key = `${year}-${month}`;
      if (!servicesPerMonth[key]) {
        servicesPerMonth[key] = 0;
      }
      servicesPerMonth[key] += appointment.services.length;
    });

    let withInsurance = 0;
    let withoutInsurance = 0;
    appointments.forEach(appointment => {
      if (appointment.isWithInsurance) {
        withInsurance += 1;
      } else {
        withoutInsurance += 1;
      }
    });

    const appointmentsPerMonth = {};
    appointments.forEach(appointment => {
      const month = appointment.dateAppointment.getMonth() + 1;
      const year = appointment.dateAppointment.getFullYear();
      const key = `${year}-${month}`;
      if (!appointmentsPerMonth[key]) {
        appointmentsPerMonth[key] = 0;
      }
      appointmentsPerMonth[key] += 1;
    });
    const maxAppointmentsMonth = Object.entries(appointmentsPerMonth).sort((a, b) => b[1] - a[1])[0];

    res.status(200).json({
      mostUsedServices,
      appointmentsPerService,
      servicesPerMonth,
      insuranceStats: { withInsurance, withoutInsurance },
      maxAppointmentsMonth
    });

  } catch (error) {
    res.status(500).json({ message: "Error al obtener las métricas", error: error.message });
  }
};

router.get('/', getMetrics);

module.exports = router;