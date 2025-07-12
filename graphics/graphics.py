import matplotlib.pyplot as plt
import tempfile

def generate_service_pie_chart(service, passed, failed, skipped):
    labels = []
    sizes = []
    colors = []
    
    if passed > 0:
        labels.append(f"Passed ({passed})")
        sizes.append(passed)
        colors.append("green")
    if failed > 0:
        labels.append(f"Failed ({failed})")
        sizes.append(failed)
        colors.append("red")
    if skipped > 0:
        labels.append(f"Skipped ({skipped})")
        sizes.append(skipped)
        colors.append("gray")

    if not sizes:
        return None  # Nada que mostrar

    fig, ax = plt.subplots()
    ax.pie(
        sizes,
        labels=labels,
        colors=colors,
        autopct=lambda pct: f"{pct:.1f}%" if pct > 0 else "",
        startangle=90,
        textprops={"fontsize": 9}
    )
    ax.axis("equal")
    plt.title(service)

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    plt.savefig(temp_file.name, bbox_inches="tight")
    plt.close()
    return temp_file.name