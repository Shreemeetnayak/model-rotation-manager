fn main() {
    // Set OUT_DIR to the target directory if not already set
    if std::env::var("OUT_DIR").is_err() {
        let out_dir = std::env::var("CARGO_TARGET_TMPDIR").unwrap_or_else(|_| "target".to_string());
        std::env::set_var("OUT_DIR", out_dir);
    }
}
