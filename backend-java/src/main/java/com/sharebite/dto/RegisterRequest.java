package com.sharebite.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String subtype;
    private String category;
    private String phone;
    private String address;
    private String city;

    public RegisterRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getSubtype() { return subtype != null ? subtype : category; }
    public void setSubtype(String subtype) { this.subtype = subtype; }

    public String getCategory() { return category != null ? category : subtype; }
    public void setCategory(String category) { this.category = category; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city != null ? city : "Metro City"; }
    public void setCity(String city) { this.city = city; }
}
