
resource "google_compute_network" "vpc_network" {
  name    = "tf-network"
  project = "clgcporg8-021"
}

resource "service_account" "svc" {
  name    = "tf-network"
  project = "clgcporg8-021"
} 

resource "google_compute_instance" "vm_instance" {
  name         = "terraform-instance"
  machine_type = "f1-micro"
  project      = "clgcporg8-021"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
    }
  }
}

