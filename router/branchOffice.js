const routes = require("express").Router();
const BranchOffice = require("../models/branchOffice");

const createOrUpdateBranchOffice = async (req, res) => {
  try {
    const { nameBranchOffice, address, phone, phoneExtension, whatsApp, email } = req.body;

    if (!nameBranchOffice || !address || !phone || !email) {
      return res.status(400).json({
        ok: false,
        msg: "Debe proporcionar el nombre, dirección, teléfono y correo electrónico del consultorio/oficina",
      });
    }

    const updatedBranchOffice = await BranchOffice.findOneAndUpdate(
      { nameBranchOffice },
      { nameBranchOffice, address, phone, phoneExtension, whatsApp, email },
      { new: true, upsert: true, runValidators: true }
    );

    const isNew = updatedBranchOffice.createdAt && updatedBranchOffice.updatedAt === updatedBranchOffice.createdAt;

    return res.status(isNew ? 201 : 200).json({
      ok: true,
      message: isNew
        ? "Consultorio/Oficina registrado con éxito."
        : "Consultorio/Oficina modificado con éxito.",
      branchOffice: updatedBranchOffice,
    });

  } catch (err) {
    console.error("Error al registrar/actualizar el Consultorio/Oficina:", err.message);

    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor. Por favor, intente de nuevo.",
      error: err.message,
    });
  }
};

const getBranchOffices = async (req, res) => {
  try {
    const branchOffices = await BranchOffice.find({ isActive: true });

    if (branchOffices.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontraron centros hospitalarios registrados."
      });
    }

    res.status(200).json({
      ok: true,
      branchOffices,
    });
  } catch (err) {
    console.error("Error al obtener los centros hospitalarios:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
}

const getBranchOfficeById = async (req, res) => {
  try {
    const { id } = req.params;

    const branchOfficeFound = await BranchOffice.findOne({ _id: id, isActive: true });

    if (!branchOfficeFound) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró el consultorio/oficina",
      });
    }

    res.status(200).json({
      ok: true,
      branchOfficeFound,
    });
  } catch (err) {
    console.error("Error al obtener el consultorio/oficina:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
}

const getBranchOfficesByName = async (req, res) => {
  try {
    const { nameBranchOffice } = req.query;

    const branchOffices = await BranchOffice.find({ nameBranchOffice: new RegExp(nameBranchOffice, 'i'), isActive: true });

    if (!branchOffices || branchOffices.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontraron consultorios/oficinas registrados."
      });
    }

    res.status(200).json({
      ok: true,
      branchOffices
    });
    
  } catch (err) {
    console.error("Error al obtener el consultorio/oficina:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
}

const updateBranchOffice = async (req, res) => {
  try {
    const { id } = req.params;

    const { nameBranchOffice, address, phone, phoneExtension, whatsApp, email } = req.body;

    const branchOfficeFound = await BranchOffice.findOne({ _id: id, isActive: true });

    if (!branchOfficeFound) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró el consultorio/oficina.",
      });
    }

    if (!nameBranchOffice && !address && !phone && !email && !isActive && !phoneExtension && !whatsApp) {
      return res.status(400).json({
        ok: false,
        msg: "Debe proporcionar algún valor a ser modificado en el consultorio/oficina",
      });
    }
    
    branchOfficeFound.nameBranchOffice = nameBranchOffice;
    branchOfficeFound.address = address;
    branchOfficeFound.phone = phone;
    branchOfficeFound.phoneExtension = phoneExtension;
    branchOfficeFound.whatsApp = whatsApp;
    branchOfficeFound.email = email;

    console.log(id, nameBranchOffice, address, phone, phoneExtension, whatsApp, email, isActive);
    
    await branchOfficeFound.save();

    res.status(200).json({
      ok: true,
      msg: "Consultorio/Oficina actualizado con éxito.",
      branchOfficeFound,
    });

  } catch (err) {
    console.error("Error al actualizar el consultorio/oficina:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
}

const deleteBranchOffice = async (req, res) => {
  try {
    const { id } = req.params;

    const branchOfficeFound = await BranchOffice.findOne({ _id: id, isActive: true });
    
    if (!branchOfficeFound) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró el consultorio/oficina.",
      });
    }

    branchOfficeFound.isActive = false;

    await branchOfficeFound.save();

    res.status(200).json({
      ok: true,
      msg: "Consultorio/Oficina eliminado con éxito.",
      branchOfficeFound,
    });

  } catch (err) {
    console.error("Error al eliminar el consultorio/oficina:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
}

const activateBranchOffice = async (req, res) => {
  try {
    const { id } = req.params;

    const branchOfficeFound = await BranchOffice.findOne({ _id: id});

    if (!branchOfficeFound) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró el consultorio/oficina.",
      });
    }

    branchOfficeFound.isActive = true;

    await branchOfficeFound.save();

    res.status(200).json({
      ok: true,
      msg: "Consultorio/Oficina activado con éxito.",
      branchOfficeFound,
    });

  } catch (err) {
    console.error("Error al activar el consultorio/oficina:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
}

const getBranchOfficeAndAviableWorkDays = async (req, res) => {
  try {
    const { id } = req.params;

    const branchOfficeFound = await BranchOffice.findOne({ _id: id, isActive: true }).populate("availableWorkDaysId");

    if (!branchOfficeFound) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró datos",
      });
    }

    res.status(200).json({
      ok: true,
      branchOfficeFound,
    });

  } catch (err) {
    console.error("Error al obtener el consultorio/oficina y los días de trabajo disponibles:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
}

routes.post("/create-or-update", createOrUpdateBranchOffice);
routes.get("/list", getBranchOffices);
routes.get("/availableWorkDays/:id", getBranchOfficeAndAviableWorkDays);
routes.get("/by-id/:id", getBranchOfficeById);
routes.get("/by-name", getBranchOfficesByName);
routes.patch("/update/:id", updateBranchOffice);
routes.delete("/delete/:id", deleteBranchOffice);
routes.post("/activate/:id", activateBranchOffice);

module.exports = routes; 