const Service = require("../models/services");
const Insurance = require("../models/insurances");

const calculateTotal = async (servicesIds, insuranceId, isWithInsurance) => {
  try {
    const services = await Service.find({ _id: { $in: servicesIds } });

    if (!services || services.length === 0) {
      throw new Error("No se encontraron servicios válidos.");
    }

    let total = 0;
    let insuranceTotal = 0;
    let userPayTotal = 0;

    const detailedServices = [];
    
    if (isWithInsurance) {
      // Buscar la aseguradora y popular los servicios
      const insurance = await Insurance.findById(insuranceId).populate({
        path: "services.service",
        select: "_id serviceName servicePrice", // Campos necesarios
      });

      if (!insurance) {
        throw new Error("Aseguradora no encontrada.");
      }

      console.log("Insurance con servicios poblados:", JSON.stringify(insurance, null, 2));

      // Crear un mapa de servicios cubiertos por la aseguradora
      const insuranceServicesMap = new Map();
      insurance.services.forEach((item) => {
        if (item.service) {
          insuranceServicesMap.set(item.service._id.toString(), item.insurancePrice);
        } else {
          console.warn(`Servicio no encontrado en la relación: ${JSON.stringify(item)}`);
        }
      });

      console.log("Mapa de servicios de la aseguradora:", insuranceServicesMap);

      // Iterar sobre los servicios solicitados y buscar precios en el seguro
      services.forEach((service) => {
        const insurancePrice = insuranceServicesMap.get(service._id.toString()); // Buscar el precio del seguro
        console.log(`ID del servicio: ${service._id.toString()} - Precio en el mapa: ${insurancePrice}`);

        if (insurancePrice !== undefined) {
          // Si el servicio está cubierto, agregar detalles
          detailedServices.push({
            serviceId: service._id,
            serviceName: service.serviceName,
            servicePrice: service.servicePrice,
            insurancePrice,
            userPay: service.servicePrice - insurancePrice,
          });
          insuranceTotal += insurancePrice;
          userPayTotal += service.servicePrice - insurancePrice;
        } else {
          // Si el servicio no está cubierto, el usuario paga el precio completo
          detailedServices.push({
            serviceId: service._id,
            serviceName: service.serviceName,
            servicePrice: service.servicePrice,
            insurancePrice: 0, // Precio del seguro es 0
            userPay: service.servicePrice, // Usuario paga todo
          });
          userPayTotal += service.servicePrice;
        }
        total += service.servicePrice; // Sumar siempre el precio total del servicio
      });
    } else {
      // Si no se usa seguro, el usuario paga todo
      services.forEach((service) => {
        detailedServices.push({
          serviceId: service._id,
          serviceName: service.serviceName,
          servicePrice: service.servicePrice,
          insurancePrice: 0, // No hay cobertura de seguro
          userPay: service.servicePrice, // Usuario paga todo
        });
        total += service.servicePrice;
        userPayTotal += service.servicePrice; // El usuario paga el total
      });
    }
    console.log({
      isWithInsurance,
      total,
      ...(isWithInsurance && {
        insuranceTotal,
        userPayTotal,
      }),
      userPayTotal, // Siempre incluir el total que paga el usuario
      detailedServices,
    })
    return {
      isWithInsurance,
      total,
      ...(isWithInsurance && {
        insuranceTotal,
        userPayTotal,
      }),
      userPayTotal, // Siempre incluir el total que paga el usuario
      detailedServices,
    };
  } catch (error) {
    console.error(error.message);
    throw new Error(`${error.message}`);
  }
};

module.exports = { calculateTotal };