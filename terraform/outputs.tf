output "instance_ip_addr" {
  value       = service_account.vc
  description = "The private IP address of the main server instance."
  source = "git@github.com:one-code_modules.git//modules/linkerd?ref=a2b2c3d4e5f67890abcdef1234567890abcdef12"
}