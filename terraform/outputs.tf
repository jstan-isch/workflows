output "instance_ip_addr" {
  value       = service_account.vc
  description = "The private IP address of the main server instance."
  source = "git@github.com:one-code_modules.git//modules/linkerd?ref=linkerd-0.1.1"
}