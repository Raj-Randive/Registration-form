import axios from "axios";
import React, { useEffect, useState } from "react";

const RegistrationForm = () => {
  const [file, setFile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [editingRegistration, setEditingRegistration] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/registrations")
      .then((response) => {
        const updatedRegistrations = response.data.map((registration) => ({
          ...registration,
        }));
        setRegistrations(updatedRegistrations);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    qualification: "",
    gender: "male",
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.qualification.trim())
      errors.qualification = "Qualification is required";
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.contact) {
      errors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact)) {
      errors.contact = "Contact number must be 10 digits";
    }
    if (!file && !editingRegistration) errors.file = "File is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "file") {
      setFile(e.target.files[0]);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("contact", formData.contact);
    formDataToSend.append("qualification", formData.qualification);
    formDataToSend.append("gender", formData.gender);

    try {
      if (editingRegistration) {
        // Update existing registration
        await axios.put(
          `http://localhost:5000/registrations/${editingRegistration}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Registration updated successfully");
      } else {
        // Add new registration
        await axios.post("http://localhost:5000/register", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Registration successful");
      }

      // Reset form and state
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
        qualification: "",
        gender: "male",
      });
      setFile(null);
      setEditingRegistration(null);
      setFormErrors({});
    } catch (error) {
      console.error("There was an error submitting the form!", error);
    }
  };

  const handleSelectRegistration = (registrationId) => {
    setSelectedRegistrations((prevSelected) =>
      prevSelected.includes(registrationId)
        ? prevSelected.filter((id) => id !== registrationId)
        : [...prevSelected, registrationId]
    );
  };

  const handleEditClick = (registration) => {
    setFormData({
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      contact: registration.contact,
      qualification: registration.qualification,
      gender: registration.gender,
    });
    setFile(null);
    setEditingRegistration(registration._id);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedRegistrations.map((registrationId) =>
          axios.delete(`http://localhost:5000/registrations/${registrationId}`)
        )
      );
      setRegistrations((prevRegistrations) =>
        prevRegistrations.filter(
          (registration) => !selectedRegistrations.includes(registration._id)
        )
      );
      setSelectedRegistrations([]);
      alert("Selected registrations deleted successfully");
    } catch (error) {
      console.error("There was an error deleting the registrations!", error);
    }
  };

  return (
    <div className="flex flex-col p-4 space-y-4 justify-center items-center text-xl">
      <div className="border-2 border-black p-4 w-full max-w-lg">
        <h1 className="text-xl font-bold mb-4 text-center">Register Here</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block font-medium">
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={`mt-1 p-2 block w-full border rounded-md ${
                formErrors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block font-medium">
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={`mt-1 p-2 block w-full border rounded-md ${
                formErrors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.lastName && (
              <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block font-medium">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`mt-1 p-2 block w-full border rounded-md ${
                formErrors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="contact" className="block font-medium">
              Contact:
            </label>
            <input
              type="tel"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className={`mt-1 p-2 block w-full border rounded-md ${
                formErrors.contact ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.contact && (
              <p className="text-red-500 text-xs mt-1">{formErrors.contact}</p>
            )}
          </div>
          <div>
            <label htmlFor="qualification" className="block font-medium">
              Qualification:
            </label>
            <input
              type="text"
              id="qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
              className={`mt-1 p-2 block w-full border rounded-md ${
                formErrors.qualification ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.qualification && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.qualification}
              </p>
            )}
          </div>
          <div>
            <span className="block font-medium">Gender:</span>
            <div className="mt-1 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2">Male</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2">Female</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === "other"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2">Other</span>
              </label>
            </div>
          </div>
          <div className="my-2 py-4">
            <label htmlFor="file" className="block font-medium">
              Upload File:
            </label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              className={`mt-1 p-2 block w-full border rounded-md ${
                formErrors.file ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.file && (
              <p className="text-red-500 text-xs mt-1">{formErrors.file}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            {editingRegistration ? "Update" : "Register"}
          </button>
        </form>
      </div>

      <div className="w-full mx-12 py-20 flex justify-center items-center flex-col">
        <h2 className="text-3xl font-bold mb-4 text-center">
          Registration List
        </h2>
        <table className="w-fit bg-white border border-gray-200 mx-10">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Select</th>
              <th className="px-4 py-2 border-b">First Name</th>
              <th className="px-4 py-2 border-b">Last Name</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Contact</th>
              <th className="px-4 py-2 border-b">Qualification</th>
              <th className="px-4 py-2 border-b">Gender</th>
              <th className="px-4 py-2 border-b">View File</th>
              <th className="px-4 py-2 border-b">File Size</th>
              <th className="px-4 py-2 border-b">Edit</th>
              <th className="px-4 py-2 border-b">Delete</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr
                key={registration._id}
                className={`hover:bg-gray-100 ${
                  selectedRegistrations.includes(registration._id)
                    ? "bg-gray-300"
                    : ""
                }`}
              >
                <td className="px-4 py-2 border-b text-center">
                  <input
                    type="checkbox"
                    checked={selectedRegistrations.includes(registration._id)}
                    onChange={() => handleSelectRegistration(registration._id)}
                  />
                </td>
                <td className="px-4 py-2 border-b">{registration.firstName}</td>
                <td className="px-4 py-2 border-b">{registration.lastName}</td>
                <td className="px-4 py-2 border-b">{registration.email}</td>
                <td className="px-4 py-2 border-b">{registration.contact}</td>
                <td className="px-4 py-2 border-b">
                  {registration.qualification}
                </td>
                <td className="px-4 py-2 border-b">{registration.gender}</td>
                <td className="px-4 py-2 border-b text-center">
                  {registration.file && (
                    <a
                      href={`http://localhost:5000/${registration.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      <i className="fas fa-file-alt text-2xl"></i>
                      <br />
                      {/* <span>{registration.file.split("\\")[1]}</span> */}
                    </a>
                  )}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  {registration.fileSize}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => handleEditClick(registration)}
                    className="text-yellow-500 hover:text-yellow-700"
                  >
                    <i className="fas fa-edit text-2xl"></i>
                  </button>
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => handleBulkDelete(registration._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-trash text-2xl"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center mt-8">
          {selectedRegistrations.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="mb-4 bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Delete Selected
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
